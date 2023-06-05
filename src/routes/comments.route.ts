import express, { Router } from 'express'
import passport from 'passport'
import asyncHandler from 'express-async-handler'
import {
  create as createComment,
  find as findComment,
  update as updateComment,
} from '../controllers/comments.controller'

const router = express.Router()

export function commentsRoutes(): Router {
  router
    .route('/')
    .post(
      passport.authenticate('jwt', { session: false }),
      asyncHandler(createComment),
    )
  router
    .route('/:commentId(\\d+)')
    .get(asyncHandler(findComment))
    .patch(
      passport.authenticate('jwt', {
        session: false,
      }),
      asyncHandler(updateComment),
    )

  return router
}
