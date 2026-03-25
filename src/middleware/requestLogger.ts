import winston from 'winston'
import { env } from '../config/env'

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp(),
    env.NODE_ENV === 'production' ? winston.format.json() : winston.format.simple(),
  ),
  defaultMeta: { service: 'pharmatrack-api' },
  transports: [new winston.transports.Console()],
})
