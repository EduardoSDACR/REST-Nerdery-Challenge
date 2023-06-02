import express, { Router } from 'express'
import passport from 'passport'
import asyncHandler from 'express-async-handler'
import {
  create as createPost,
  find as findPost,
  update as updatePost,
  deletePost,
} from '../controllers/posts.controller'

const router = express.Router()

export function postsRoutes(): Router {
  router
    .route('/')
    .post(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(createPost),
    )
  router
    .route('/:postId(\\d+)')
    .get(asyncHandler(findPost))
    .patch(
      passport.authenticate('jwt', {
        session: false,
      }),
      asyncHandler(updatePost),
    )
    .delete(
      passport.authenticate('jwt', {
        session: false,
      }),
      asyncHandler(deletePost),
    )

  return router
}
