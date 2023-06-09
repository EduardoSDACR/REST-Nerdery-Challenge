import express, { Router } from 'express'
import passport from 'passport'
import asyncHandler from 'express-async-handler'
import {
  create as createComment,
  find as findComment,
  update as updateComment,
  deleteComment,
  dislikeComment,
  likeComment,
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
    .delete(
      passport.authenticate('jwt', {
        session: false,
      }),
      asyncHandler(deleteComment),
    )
  router
    .route('/:commentId(\\d+)/like')
    .all(passport.authenticate('jwt', { session: false }))
    .patch(asyncHandler(likeComment))
  router
    .route('/:commentId(\\d+)/dislike')
    .all(passport.authenticate('jwt', { session: false }))
    .patch(asyncHandler(dislikeComment))

  return router
}
