import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import passport from 'passport'
import { login, logout, signup } from '../controllers/accounts.controller'

const router = express.Router()

export function accountsRoutes(): Router {
  router.route('/login').post(asyncHandler(login))
  router.route('/signup').post(asyncHandler(signup))
  router.route('/logout').delete(asyncHandler(logout))

  return router
}
