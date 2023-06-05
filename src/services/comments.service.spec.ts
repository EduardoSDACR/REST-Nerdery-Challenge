import { plainToInstance } from 'class-transformer'
import faker from 'faker'
import { NotFound } from 'http-errors'
import { UserFactory } from '../utils/factories/user.factory'
import { PostFactory } from '../utils/factories/post.factory'
import { clearDatabase, prisma } from '../prisma'
import { CommentFactory } from '../utils/factories/comment.factory'
import { CreateCommentDto } from '../dtos/comments/request/create-comment.dto'
import { CommentDto } from '../dtos/comments/response/comment.dto'
import { CommentsService } from './comments.service'

describe('CommentsService', () => {
  let userFactory: UserFactory
  let postFactory: PostFactory
  let commentFactory: CommentFactory

  beforeAll(() => {
    userFactory = new UserFactory(prisma)
    postFactory = new PostFactory(prisma)
    commentFactory = new CommentFactory(prisma)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await clearDatabase()
    await prisma.$disconnect()
  })

  describe('create', () => {
    test('should throw an error if post does not exist', () => {
      const data = plainToInstance(CreateCommentDto, {
        content: faker.lorem.sentence(),
        postId: faker.datatype.number(),
      })

      expect(
        CommentsService.create(data, faker.datatype.number()),
      ).rejects.toThrowError(new NotFound('Post not found'))
    })

    test('should create a new comment', async () => {
      const user = await userFactory.make()
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: {
          connect: {
            id: user.id,
          },
        },
      })
      const data = plainToInstance(CreateCommentDto, {
        content: faker.lorem.sentence(),
        published: faker.datatype.boolean(),
        postId: post.id,
      })

      const result = await CommentsService.create(data, user.id)

      expect(result).toMatchObject({
        authorId: user.id,
        ...data,
      })
    })
  })

  describe('find', () => {
    test('should throw an error if comment does not exist', async () => {
      await expect(
        CommentsService.find(faker.datatype.number()),
      ).rejects.toThrowError(new NotFound('Comment not found'))
    })

    test('should return the comment found', async () => {
      const user = await userFactory.make()
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: { connect: { id: user.id } },
      })
      const comment = await commentFactory.make({
        content: faker.lorem.sentence(),
        post: {
          connect: {
            id: post.id,
          },
        },
        author: {
          connect: {
            id: user.id,
          },
        },
      })

      const result = await CommentsService.find(comment.id)

      expect(result).toMatchObject(plainToInstance(CommentDto, comment))
    })
  })
})
