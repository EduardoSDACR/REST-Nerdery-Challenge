import { NotFound } from 'http-errors'
import { plainToInstance } from 'class-transformer'
import faker from 'faker'
import { clearDatabase, prisma } from '../prisma'
import { CreatePostDto } from '../dtos/posts/request/create-post.dto'
import { UserFactory } from '../utils/factories/user.factory'
import { PostsService } from './posts.service'

describe('PostsService', () => {
  let userFactory: UserFactory

  beforeAll(() => {
    userFactory = new UserFactory(prisma)
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
})
