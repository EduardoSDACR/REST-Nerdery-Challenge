import faker from 'faker'
import { plainToInstance } from 'class-transformer'
import { NotFound, Unauthorized, UnprocessableEntity } from 'http-errors'
import jwt from 'jsonwebtoken'
import { SignupDto } from '../dtos/accounts/request/signup.dto'
import { clearDatabase, prisma } from '../prisma'
import { UserFactory } from '../utils/factories/user.factory'
import { TokenFactory } from '../utils/factories/token.factory'
import { PostFactory } from '../utils/factories/post.factory'
import { ProfileDto } from '../dtos/accounts/response/profile.dto'
import { UpdateProfileDto } from '../dtos/accounts/request/update-profile.dto'
import { AccountsService } from './accounts.service'

describe('AccountsService', () => {
  let userFactory: UserFactory
  let tokenFactory: TokenFactory
  let postFactory: PostFactory

  beforeAll(() => {
    userFactory = new UserFactory(prisma)
    tokenFactory = new TokenFactory(prisma)
    postFactory = new PostFactory(prisma)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(async () => {
    await clearDatabase()
    await prisma.$disconnect()
  })

  describe('signup', () => {
    test('should throw an error when email is already used', async () => {
      const email = faker.internet.email()
      await userFactory.make({ email })
      const data = plainToInstance(SignupDto, {
        nick: faker.internet.userName(),
        name: faker.name.findName(),
        email,
        password: faker.internet.password(8),
      })

      await expect(AccountsService.signup(data)).rejects.toThrowError(
        new UnprocessableEntity('The email is already taken'),
      )
    })

    test('should create an account', async () => {
      const spyCreateToken = jest.spyOn(AccountsService, 'createToken')
      const spyGenerateAccessToken = jest.spyOn(
        AccountsService,
        'generateAccessToken',
      )
      const data = plainToInstance(SignupDto, {
        nick: faker.internet.userName(),
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(8),
      })

      const result = await AccountsService.signup(data)

      expect(spyCreateToken).toHaveBeenCalledTimes(1)
      expect(spyGenerateAccessToken).toHaveBeenCalledTimes(1)
      expect(result).toHaveProperty('accessToken', expect.any(String))
      expect(result).toHaveProperty('exp', expect.any(String))
    })
  })

  describe('logout', () => {
    test('should throw an error when jwt is undefined', async () => {
      await expect(AccountsService.logout(undefined)).rejects.toThrowError(
        new Unauthorized('Authentication not provided'),
      )
    })

    test('should throw an error when jwt is invalid', async () => {
      await expect(
        AccountsService.logout(faker.lorem.word()),
      ).rejects.toThrowError(new Unauthorized('Invalid authentication'))
    })

    test('should throw an error when prisma cannot find the token', async () => {
      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(jest.fn(() => ({ sub: faker.lorem.word() })))

      await expect(
        AccountsService.logout(faker.lorem.word()),
      ).rejects.toThrowError(new NotFound('Session not found'))
    })

    test('should delete the session token of user', async () => {
      const token = await tokenFactory.make({
        user: { connect: { id: (await userFactory.make()).id } },
      })
      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(jest.fn(() => ({ sub: token.jti })))

      const result = await AccountsService.logout(faker.lorem.word())

      expect(result).toBeUndefined()
    })
  })

  describe('findAccountPosts', () => {
    test('should throw a not found error when the account do not exist', async () => {
      await expect(
        AccountsService.findAccountPosts(faker.datatype.number()),
      ).rejects.toThrowError(new NotFound('Account not found'))
    })

    test('should return all published posts of an specific account', async () => {
      const user = await userFactory.make()
      const posts = await postFactory.makeMany(5, {
        title: faker.lorem.sentence(),
        author: { connect: { id: user.id } },
      })
      const publishedPosts = posts.filter((post) => post.published)

      const result = await AccountsService.findAccountPosts(user.id)

      expect(result.length).toBe(publishedPosts.length)
    })
  })

  describe('profile', () => {
    test('should throw error when user not exist', async () => {
      await expect(
        AccountsService.profile(faker.datatype.number()),
      ).rejects.toThrowError(new NotFound('User not found'))
    })

    test('should return the user profile', async () => {
      const user = await userFactory.make()
      const result = await AccountsService.profile(user.id)

      expect(result).toMatchObject(plainToInstance(ProfileDto, user))
    })
  })

  describe('updateProfile', () => {
    test('should throw error when user not exist', async () => {
      const data = plainToInstance(UpdateProfileDto, {})

      await expect(
        AccountsService.updateProfile(faker.datatype.number(), data),
      ).rejects.toThrowError(new NotFound('User not found'))
    })

    test('should throw an error when user tries to update its email with an existing one', async () => {
      const existingEmail = faker.internet.email()
      const [user] = await Promise.all([
        userFactory.make(),
        userFactory.make({ email: existingEmail }),
      ])

      const data = plainToInstance(UpdateProfileDto, { email: existingEmail })

      await expect(
        AccountsService.updateProfile(user.id, data),
      ).rejects.toThrowError(new UnprocessableEntity('Email is already taken'))
    })

    test('should update user data', async () => {
      const user = await userFactory.make()
      const nick = 'new alias'
      const name = 'new name'
      const updateData = plainToInstance(UpdateProfileDto, {
        nick,
        name,
      })

      const result = await AccountsService.updateProfile(user.id, updateData)

      expect(result).toHaveProperty('nick', nick)
      expect(result).toHaveProperty('name', name)
      expect(result).toHaveProperty('publicName', user.publicName)
    })
  })
})
