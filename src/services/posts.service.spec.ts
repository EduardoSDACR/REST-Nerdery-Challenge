import { NotFound } from 'http-errors'
import { plainToInstance } from 'class-transformer'
import faker from 'faker'
import { clearDatabase, prisma } from '../prisma'
import { CreatePostDto } from '../dtos/posts/request/create-post.dto'
import { UserFactory } from '../utils/factories/user.factory'
import { PostFactory } from '../utils/factories/post.factory'
import { PostDto } from '../dtos/posts/response/post.dto'
import { PostsService } from './posts.service'

describe('PostsService', () => {
  let userFactory: UserFactory
  let postFactory: PostFactory

  beforeAll(() => {
    userFactory = new UserFactory(prisma)
    postFactory = new PostFactory(prisma)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await clearDatabase()
    await prisma.$disconnect()
  })

  describe('create', () => {
    test('should throw an error if owner does not exist', () => {
      const data = plainToInstance(CreatePostDto, {
        title: faker.lorem.sentence(),
        published: faker.datatype.boolean(),
      })

      expect(
        PostsService.create(data, faker.datatype.number()),
      ).rejects.toThrowError(new NotFound('Author not found'))
    })

    test('should create a new post', async () => {
      const user = await userFactory.make()
      const data = plainToInstance(CreatePostDto, {
        title: faker.lorem.sentence(),
        published: faker.datatype.boolean(),
      })

      const result = await PostsService.create(data, user.id)

      expect(result).toMatchObject({
        authorId: user.id,
        ...data,
      })
    })
  })

  describe('find', () => {
    test('should throw an error if post does not exist', async () => {
      await expect(
        PostsService.find(faker.datatype.number()),
      ).rejects.toThrowError(new NotFound('Post not found'))
    })

    test('should return the post found', async () => {
      const post = await postFactory.make({
        title: faker.lorem.sentence(),
        author: { connect: { id: (await userFactory.make()).id } },
      })

      const result = await PostsService.find(post.id)

      expect(result).toMatchObject(plainToInstance(PostDto, post))
    })
  })
})
