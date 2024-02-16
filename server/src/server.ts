import express, { Express, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { check, validationResult } from 'express-validator'
import multer from 'multer'
import pinataSDK from '@pinata/sdk'
import { Readable } from 'stream'
import { validateMetadata } from './validate'
import cors from 'cors'
import helmet from 'helmet'
import { logger } from './logger'

class Server {
  private app: Express
  private upload: multer.Multer
  private pinata: pinataSDK

  constructor() {
    if (!process.env.PINATA_KEY || !process.env.PINATA_SECRET) {
      throw new Error(
        'Missing PINATA_KEY or PINATA_SECRET environment variables'
      )
    }

    this.app = express()
    this.app.use(helmet()) // add Helmet
    this.app.use(
      cors({
        origin: '*',
        optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
      })
    )
    this.upload = multer({
      limits: {
        fileSize: 500 * 1024, // limit file size to 500KB
      },
    })
    this.pinata = new pinataSDK({
      pinataApiKey: process.env.PINATA_KEY,
      pinataSecretApiKey: process.env.PINATA_SECRET,
    })
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware() {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // limit each IP to 100 requests per windowMs
    })

    this.app.use(limiter) // apply rate limiting
    this.app.use(express.json())

    // Error handling middleware
    this.app.use(
      (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        logger.error(err)
        res.status(500).send('File too large')
      }
    )
  }

  private setupRoutes() {
    this.app.post(
      '/uploadFile',
      this.upload.single('image'),
      async (req: Request, res: Response) => {
        if (!req.file || !req.file.buffer || !req.file.originalname) {
          logger.error('No file uploaded')
          return res.status(400).json({ error: 'No file uploaded' })
        }

        // Validate mimetype
        const validMimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic'] // Add any other image types you want to accept
        if (!validMimetypes.includes(req.file.mimetype)) {
          logger.error('Invalid file type')
          return res.status(400).json({ error: 'Invalid file type' })
        }

        // todo: file content validation
        const fileContent = req.file.buffer

        const readableStreamForFile = Readable.from(req.file.buffer)
        this.pinata
          .pinFileToIPFS(readableStreamForFile, {
            pinataMetadata: { name: req.file.originalname },
          })
          .then(result => {
            logger.info(`Metadata uploaded: ${result.IpfsHash}}`)
            res.json(result)
          })
          .catch(err => {
            logger.error(err)
            res.status(500).json(err)
          })
      }
    )

    this.app.post(
      '/uploadMetadata',
      [check('metadata').isObject()],
      (req: Request, res: Response) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() })
        }

        const valid = validateMetadata(req.body.metadata)
        if (!valid) {
          return res.status(400).json({
            error: 'Invalid metadata',
            errors: validateMetadata.errors,
          })
        }

        this.pinata
          .pinJSONToIPFS(req.body.metadata)
          .then(result => {
            logger.info(`Metadata uploaded: ${result.IpfsHash}}`)
            res.json(result)
          })
          .catch(err => {
            logger.error(err)
            res.status(500).json(err)
          })
      }
    )
  }

  public start(port: number) {
    this.app.listen(port, () => logger.info(`Server running on port ${port}`))
  }
}

export default Server
