import faker from 'faker'
import { plainToInstance } from 'class-transformer'
import { Unauthorized, UnprocessableEntity } from 'http-errors'
import jwt from 'jsonwebtoken'
import { SignupDto } from '../dtos/accounts/request/signup.dto'
import { clearDatabase, prisma } from '../prisma'
import { UserFactory } from '../utils/factories/user.factory'
import { TokenFactory } from '../utils/factories/token.factory'
import { AccountsService } from './accounts.service'

describe('AccountsService', () => {
  let userFactory: UserFactory
  let tokenFactory: TokenFactory

  beforeAll(() => {
    userFactory = new UserFactory(prisma)
    tokenFactory = new TokenFactory(prisma)
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
    test('should throw an error when jwt is undefined', () => {
      const result = AccountsService.logout(undefined)

      expect(result).rejects.toThrowError(
        new Unauthorized('Authentication not provided'),
      )
    })

    test('should throw an error when jwt is invalid', () => {
      const result = AccountsService.logout(faker.lorem.word())

      expect(result).rejects.toThrowError(
        new Unauthorized('Invalid authentication'),
      )
    })

    test('should throw an error when prisma cannot find the token', () => {
      jest
        .spyOn(jwt, 'verify')
        .mockImplementation(jest.fn(() => ({ sub: faker.lorem.word() })))

      const result = AccountsService.logout(faker.lorem.word())

      expect(result).rejects.toThrowError('Session not found')
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
})
