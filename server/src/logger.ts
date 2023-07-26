import { createLogger, format } from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'

const fileTransport = new DailyRotateFile({
  filename: path.join('logs', 'application-%DATE%.log'), // Set the filename to include the "logs" folder
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
})

export const logger = createLogger({
  format: format.combine(format.timestamp(), format.json()),
  transports: [fileTransport],
})
