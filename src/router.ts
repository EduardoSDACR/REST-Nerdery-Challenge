import express, { Router } from 'express'
import { accountsRoutes } from './routes/accounts.route'
import { postsRoutes } from './routes/posts.route'
import { commentsRoutes } from './routes/comments.route'

const expressRouter = express.Router()

export function router(app: Router): Router {
  app.use('/api/v1/accounts', accountsRoutes())
  app.use('/api/v1/posts', postsRoutes())
  app.use('/api/v1/comments', commentsRoutes())

  return expressRouter
}
