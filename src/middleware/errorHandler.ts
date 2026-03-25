import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from './requestLogger'

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      details: err.details,
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.flatten(),
    })
    return
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack })

  res.status(500).json({
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  })
}
