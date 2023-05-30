import faker from 'faker'
import { plainToInstance } from 'class-transformer'
import { UnprocessableEntity } from 'http-errors'
import { SignupDto } from '../dtos/accounts/request/signup.dto'
import { clearDatabase, prisma } from '../prisma'
import { UserFactory } from '../utils/factories/user.factory'
import { AccountsService } from './accounts.service'

describe('AccountsService', () => {
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

  describe('signup', () => {
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
  })
})
