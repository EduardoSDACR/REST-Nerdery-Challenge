import { NotFound } from 'http-errors'
import { plainToInstance } from 'class-transformer'
import { Prisma } from '@prisma/client'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'
import { CreateCommentDto } from '../dtos/comments/request/create-comment.dto'
import { CommentDto } from '../dtos/comments/response/comment.dto'

export class CommentsService {
  static async create(
    input: CreateCommentDto,
    authorId: number,
  ): Promise<CommentDto> {
    try {
      const comment = await prisma.comment.create({
        data: {
          ...input,
          authorId,
        },
      })

      return plainToInstance(CommentDto, comment)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.FOREIGN_KEY_CONSTRAINT:
            throw new NotFound('Post not found')
          default:
            throw error
        }
      }

      throw error
    }
  }
}
