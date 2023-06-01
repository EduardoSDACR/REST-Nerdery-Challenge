import express, { Router } from 'express'
import asyncHandler from 'express-async-handler'
import passport from 'passport'
import {
  findAccountPosts,
  login,
  logout,
  profile,
  signup,
} from '../controllers/accounts.controller'

const router = express.Router()

export function accountsRoutes(): Router {
  router.route('/login').post(asyncHandler(login))
  router.route('/signup').post(asyncHandler(signup))
  router.route('/logout').delete(asyncHandler(logout))
  router.route('/:accountId/posts').get(asyncHandler(findAccountPosts))
  router
    .route('/me/profile')
    .all(passport.authenticate('jwt', { session: false }))
    .get(asyncHandler(profile))

  return router
}
