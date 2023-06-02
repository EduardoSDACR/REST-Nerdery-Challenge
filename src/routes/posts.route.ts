import express, { Router } from 'express'
import passport from 'passport'
import asyncHandler from 'express-async-handler'
import {
  create as createPost,
  find as findPost,
} from '../controllers/posts.controller'

const router = express.Router()

export function postsRoutes(): Router {
  router
    .route('/')
    .all(passport.authenticate('jwt', { session: false }))
    .post(asyncHandler(createPost))

  router.route('/:postId(\\d+)').get(asyncHandler(findPost))

  return router
}
