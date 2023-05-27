import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { login } from '../controllers/accounts.controller'

const router = express.Router()

export function accountsRoutes(): Router {
  router.route('/login').post(asyncHandler(login))

  return router
}
