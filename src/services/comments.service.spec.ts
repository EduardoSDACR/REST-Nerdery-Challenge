import { plainToInstance } from 'class-transformer'
import faker from 'faker'
import { NotFound, Unauthorized } from 'http-errors'
import { UserFactory } from '../utils/factories/user.factory'
import { PostFactory } from '../utils/factories/post.factory'
import { clearDatabase, prisma } from '../prisma'
import { CommentFactory } from '../utils/factories/comment.factory'
import { CreateCommentDto } from '../dtos/comments/request/create-comment.dto'
import { CommentDto } from '../dtos/comments/response/comment.dto'
import { UpdatePostDto } from '../dtos/posts/request/update-post.dto'
import { UpdateCommentDto } from '../dtos/comments/request/update-comment.dto'
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

  describe('update', () => {
    test('should throw an error if comment does not exist', async () => {
      const data = plainToInstance(UpdateCommentDto, {})

      await expect(
        CommentsService.update(
          data,
          faker.datatype.number(),
          faker.datatype.number(),
        ),
      ).rejects.toThrowError(new NotFound('Comment not found'))
    })

    test('should throw an error if user is not the owner of comment', async () => {
      const [firstUser, secondUser] = await userFactory.makeMany(2, {})
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: { connect: { id: firstUser.id } },
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
            id: secondUser.id,
          },
        },
      })
      const data = plainToInstance(UpdatePostDto, {})

      await expect(
        CommentsService.update(data, comment.id, firstUser.id),
      ).rejects.toThrowError(
        new Unauthorized('This account does not own this comment'),
      )
    })

    test('should update the comment of owner user', async () => {
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
      const content = faker.lorem.sentence()
      const data = plainToInstance(UpdateCommentDto, { content })

      const result = await CommentsService.update(data, comment.id, user.id)

      expect(result).toHaveProperty('content', content)
    })
  })

  describe('delete', () => {
    test('should throw an error if comment does not exist', async () => {
      await expect(
        CommentsService.delete(
          faker.datatype.number(),
          faker.datatype.number(),
        ),
      ).rejects.toThrowError(new NotFound('Comment not found'))
    })

    test('should throw an error if user is not the owner of comment', async () => {
      const [firstUser, secondUser] = await userFactory.makeMany(2, {})
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: { connect: { id: firstUser.id } },
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
            id: secondUser.id,
          },
        },
      })

      await expect(
        CommentsService.delete(comment.id, firstUser.id),
      ).rejects.toThrowError(
        new Unauthorized('This account does not own this comment'),
      )
    })

    test('should delete the comment of owner user', async () => {
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

      const result = await CommentsService.delete(comment.id, user.id)

      expect(result).toBeUndefined()
    })
  })

  describe('register', () => {
    test('should throw an error when comment does not exist', async () => {
      await expect(
        CommentsService.register(
          faker.datatype.number(),
          faker.datatype.number(),
          'LIKE',
        ),
      ).rejects.toThrowError(new NotFound('Comment not found'))
    })

    test('should decrease the likes field of comment when user already like/dislike the comment', async () => {
      const user = await userFactory.make()
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: { connect: { id: user.id } },
      })
      const comment = await commentFactory.make({
        content: faker.lorem.sentence(),
        likes: 1,
        dislikes: 0,
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
        usersRegister: {
          create: [
            {
              type: 'LIKE',
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          ],
        },
      })

      const result = await CommentsService.register(comment.id, user.id, 'LIKE')

      expect(result.likes).toBe(comment.likes - 1)
    })

    test('should increase likes/dislikes field of comment by one', async () => {
      const user = await userFactory.make()
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: { connect: { id: user.id } },
      })
      const comment = await commentFactory.make({
        content: faker.lorem.sentence(),
        likes: 0,
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

      const result = await CommentsService.register(comment.id, user.id, 'LIKE')

      expect(result.likes).toBe(comment.likes + 1)
    })

    test('should change user like register to dislike and vice versa when user already has a register on comment', async () => {
      const user = await userFactory.make()
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: {
          connect: {
            id: user.id,
          },
        },
      })
      const comment = await commentFactory.make({
        content: faker.lorem.sentence(),
        likes: 0,
        dislikes: 1,
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
        usersRegister: {
          create: [
            {
              type: 'DISLIKE',
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          ],
        },
      })

      const result = await CommentsService.register(comment.id, user.id, 'LIKE')

      expect(result.dislikes).toBe(comment.dislikes - 1)
      expect(result.likes).toBe(comment.likes + 1)
    })

    test('should exist the same amount of like registers as likes/dislikes made to comment', async () => {
      const [firstUser, secondUser] = await userFactory.makeMany(2)
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: { connect: { id: firstUser.id } },
      })
      const comment = await commentFactory.make({
        content: faker.lorem.sentence(),
        likes: 0,
        post: {
          connect: {
            id: post.id,
          },
        },
        author: {
          connect: {
            id: firstUser.id,
          },
        },
      })
      await CommentsService.register(comment.id, firstUser.id, 'LIKE')
      await CommentsService.register(comment.id, secondUser.id, 'DISLIKE')

      const result = await prisma.usersCommentsRegister.findMany({
        where: {
          commentId: comment.id,
        },
      })

      expect(result.length).toBe(comment.likes + 2)
    })
  })
})
