import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { login, signup } from '../controllers/accounts.controller'

const router = express.Router()

export function accountsRoutes(): Router {
  router.route('/login').post(asyncHandler(login))
  router.route('/signup').post(asyncHandler(signup))

  return router
}
