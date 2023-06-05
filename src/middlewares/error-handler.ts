import { HttpError } from 'http-errors'
import { Request, Response, NextFunction } from 'express'
import { plainToClass } from 'class-transformer'
import { HttpErrorDto } from '../dtos/http-error.dto'

export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  if (process.env.ENVIRONMENT !== 'development') {
    // eslint-disable-next-line no-console
    console.error(err.message)
    // eslint-disable-next-line no-console
    console.error(err.stack || '')
  }

  res.status(err.status ?? 500).json(plainToClass(HttpErrorDto, err))
}
