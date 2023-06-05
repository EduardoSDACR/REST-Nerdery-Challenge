import { Prisma, PrismaClient, Comment } from '@prisma/client'
import faker from 'faker'
import { AbstractFactory } from './abstract.factory'

type CommentInput = Prisma.CommentCreateInput

export class CommentFactory extends AbstractFactory<Comment> {
  constructor(protected readonly prismaClient: PrismaClient) {
    super()
  }

  async make(input: CommentInput): Promise<Comment> {
    return this.prismaClient.comment.create({
      data: {
        ...input,
        content: input.content ?? faker.lorem.sentence(),
        published: input.published ?? faker.datatype.boolean(),
        likes: input.likes ?? faker.datatype.number(),
        dislikes: input.dislikes ?? faker.datatype.number(),
      },
    })
  }

  async makeMany(factorial: number, input: CommentInput): Promise<Comment[]> {
    return Promise.all([...Array(factorial)].map(() => this.make(input)))
  }
}
