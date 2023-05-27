import { Unauthorized } from 'http-errors'
import { Request, Response, NextFunction } from 'express'

export const validateAccount = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    throw new Unauthorized('You need a token')
  }

  next()
}
