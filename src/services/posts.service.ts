import { plainToInstance } from 'class-transformer'
import { NotFound, Unauthorized, UnprocessableEntity } from 'http-errors'
import { Prisma } from '@prisma/client'
import { CreatePostDto } from '../dtos/posts/request/create-post.dto'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'
import { PostDto } from '../dtos/posts/response/post.dto'
import { UpdatePostDto } from '../dtos/posts/request/update-post.dto'

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

  static async update(
    input: UpdatePostDto,
    postId: number,
    accountId: number,
  ): Promise<PostDto> {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })

    if (!post) {
      throw new NotFound('Post not found')
    }

    if (post.authorId !== accountId) {
      throw new Unauthorized('This account does not own this post')
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        ...input,
      },
    })

    return plainToInstance(PostDto, updatedPost)
  }

  static async delete(postId: number, accountId: number): Promise<void> {
    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    })

    if (!post) {
      throw new NotFound('Post not found')
    }

    if (post.authorId !== accountId) {
      throw new Unauthorized('This account does not own this post')
    }

    await prisma.post.delete({
      where: {
        id: postId,
      },
    })
  }

  static async register(
    postId: number,
    accountId: number,
    type: 'LIKE' | 'DISLIKE',
  ): Promise<PostDto> {
    let data: Prisma.PostUpdateInput = {
      [type.toLocaleLowerCase() + 's']: {
        increment: 1,
      },
      usersRegister: {
        create: {
          type,
          user: {
            connect: {
              id: accountId,
            },
          },
        },
      },
    }

    const register = await prisma.usersPostsRegister.findUnique({
      where: {
        userId_postId: {
          userId: accountId,
          postId: postId,
        },
      },
    })

    if (register && register.type === type) {
      data = {
        [type.toLocaleLowerCase() + 's']: {
          decrement: 1,
        },
        usersRegister: {
          delete: {
            userId_postId: {
              userId: accountId,
              postId: postId,
            },
          },
        },
      }
    } else if (register && register.type !== type) {
      data = {
        [type.toLocaleLowerCase() + 's']: {
          increment: 1,
        },
        [type == 'LIKE' ? 'dislikes' : 'likes']: {
          decrement: 1,
        },
        usersRegister: {
          update: {
            where: {
              userId_postId: {
                userId: accountId,
                postId: postId,
              },
            },
            data: {
              type,
            },
          },
        },
      }
    }

    try {
      const post = await prisma.post.update({
        where: {
          id: postId,
        },
        data,
      })

      return plainToInstance(PostDto, post)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFound('Post not found')
          default:
            throw error
        }
      }

      throw error
    }
  }
}
