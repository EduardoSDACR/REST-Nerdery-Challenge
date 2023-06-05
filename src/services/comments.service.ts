import { NotFound, Unauthorized } from 'http-errors'
import { plainToInstance } from 'class-transformer'
import { Prisma } from '@prisma/client'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'
import { CreateCommentDto } from '../dtos/comments/request/create-comment.dto'
import { CommentDto } from '../dtos/comments/response/comment.dto'
import { UpdateCommentDto } from '../dtos/comments/request/update-comment.dto'

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

  static async find(commentId: number): Promise<CommentDto> {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      throw new NotFound('Comment not found')
    }

    return plainToInstance(CommentDto, comment)
  }

  static async update(
    input: UpdateCommentDto,
    commentId: number,
    accountId: number,
  ): Promise<CommentDto> {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      throw new NotFound('Comment not found')
    }

    if (comment.authorId !== accountId) {
      throw new Unauthorized('This account does not own this comment')
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId,
      },
      data: {
        ...input,
      },
    })

    return plainToInstance(CommentDto, updatedComment)
  }

  static async delete(commentId: number, accountId: number): Promise<void> {
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    })

    if (!comment) {
      throw new NotFound('Comment not found')
    }

    if (comment.authorId !== accountId) {
      throw new Unauthorized('This account does not own this comment')
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    })
  }
}
