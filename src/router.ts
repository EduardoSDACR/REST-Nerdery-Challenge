import express, { Router } from 'express'
import { accountsRoutes } from './routes/accounts.route'

const expressRouter = express.Router()

export function router(app: Router): Router {
  app.use('/api/v1/accounts', accountsRoutes())

  return expressRouter
}
