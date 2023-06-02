import { plainToInstance } from 'class-transformer'
import { NotFound } from 'http-errors'
import { Prisma } from '@prisma/client'
import { CreatePostDto } from '../dtos/posts/request/create-post.dto'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'
import { PostDto } from '../dtos/posts/response/post.dto'

export class PostsService {
  static async create(
    input: CreatePostDto,
    authorId: number,
  ): Promise<PostDto> {
    try {
      const post = await prisma.post.create({
        data: {
          ...input,
          authorId,
        },
      })

      return plainToInstance(PostDto, post)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.FOREIGN_KEY_CONSTRAINT:
            throw new NotFound('Author not found')
          default:
            throw error
        }
      }

      throw error
    }
  }

  static async find(postId: number): Promise<PostDto> {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })

    if (!post) {
      throw new NotFound('Post not found')
    }

    return plainToInstance(PostDto, post)
  }
}
