import express, { Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { check, validationResult } from 'express-validator'
import { validateMetadata } from './validate'
import pinataSDK from '@pinata/sdk'
import helmet from 'helmet'
import dotenv from 'dotenv'
import Busboy from 'busboy'
import path from 'path'
import os from 'os'
import fs from 'fs'

dotenv.config()

if (!process.env.PINATA_KEY || !process.env.PINATA_SECRET) {
  throw new Error('Missing PINATA_KEY or PINATA_SECRET environment variables')
}

const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET,
})

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
})

const app = express()

app.set('trust proxy', 1) // trust first proxy

app.use(helmet()) // add Helmet
app.use(limiter) // apply rate limiting
app.use(express.json())

app.post('/uploadFile', (req: Request, res: Response) => {
  console.log('Received file upload request')

  if (req.method !== 'POST') {
    console.log('Method not allowed')
    // Return a "method not allowed" error
    return res.status(405).end()
  }

  const busboy = Busboy({
    headers: req.headers,
    limits: { files: 1, fileSize: 30485760 },
  })
  const tmpdir = os.tmpdir()

  const uploads: { [key: string]: string } = {}

  const fileWrites: Promise<void>[] = []

  let isTooLarge = false

  busboy.on(
    'file',
    (
      fieldname: string,
      file: NodeJS.ReadableStream,
      { filename }: { filename: string }
    ) => {
      console.log(`Processing file ${filename}`)
      const filepath = path.join(tmpdir, filename)
      uploads[fieldname] = filepath

      const writeStream = fs.createWriteStream(filepath)
      file.pipe(writeStream)

      file.on('limit', () => {
        console.log(`File ${filename} is too large`)
        // Destroy the write stream to prevent the file from being saved
        writeStream.destroy(new Error('File too large'))
        isTooLarge = true
      })

      const promise = new Promise<void>((resolve, reject) => {
        file.on('end', () => {
          writeStream.end()
        })
        writeStream.on('finish', resolve)
        writeStream.on('error', err => {
          if (err.message === 'File too large') {
            res.status(413).json({ error: 'File too large' })
          } else {
            reject(err)
          }
        })
      })
      fileWrites.push(promise)
    }
  )

  busboy.on('finish', async () => {
    if (isTooLarge) return
    await Promise.all(fileWrites)

    // Process saved files here
    for (const file in uploads) {
      console.log(`Uploading file ${file} to IPFS`)
      const readableStreamForFile = fs.createReadStream(uploads[file])
      pinata
        .pinFileToIPFS(readableStreamForFile, {
          pinataMetadata: { name: file },
        })
        .then(result => {
          console.log(`Metadata uploaded: ${result.IpfsHash}`)
          fs.unlinkSync(uploads[file]) // Delete file after uploading
          res.json(result)
        })
        .catch(err => {
          console.log(`Error uploading file ${file}: ${err}`)
          res.status(500).json(err)
        })
    }
  })

  busboy.end((req as any).rawBody)
})

app.post(
  '/uploadMetadata',
  [check('metadata').isObject()],
  (req: Request, res: Response) => {
    // CORS headers are set in exports.poidh
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

    pinata
      .pinJSONToIPFS(req.body.metadata)
      .then(result => {
        console.log(`Metadata uploaded: ${result.IpfsHash}`)
        res.json(result)
      })
      .catch(err => {
        console.log(err)
        res.status(500).json(err)
      })
  }
)

exports.poidh = (req: Request, res: Response) => {
  res.set('Access-Control-Allow-Origin', 'https://poidh.xyz')
  res.set('Access-Control-Allow-Methods', 'POST')
  res.set('Access-Control-Allow-Headers', 'Content-Type')

  if (!req.url) {
    req.url = '/'
    req.path = '/'
  }
  return app(req, res)
}
