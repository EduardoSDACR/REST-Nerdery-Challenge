import faker from 'faker'
import { NodemailerService } from '../services/nodemailer.service'
import { userEmailConfirmationEvent } from './mail.event'

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockImplementation(() => {
      return {
        sendMail: () => {
          return {
            messageId: 'Verification email sent',
          }
        },
      }
    }),
  }
})

describe('userEmailConfirmationEvent', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
  })

  test('should be logger the error when something goes wrong with email sent', async () => {
    jest
      .spyOn(NodemailerService, 'sendEmail')
      .mockImplementation(jest.fn(() => Promise.reject('error')))

    const spyConsole = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    await userEmailConfirmationEvent({
      email: faker.internet.email(),
      userId: faker.datatype.number(),
    })

    expect(spyConsole).toBeCalledWith('error')
  })

  test('should send the email confirmation', async () => {
    jest
      .spyOn(NodemailerService, 'sendEmail')
      .mockImplementation(jest.fn(() => Promise.resolve()))

    const result = await userEmailConfirmationEvent({
      email: faker.internet.email(),
      userId: faker.datatype.number(),
    })

    const spyConsole = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    expect(result).toBeUndefined()
    expect(spyConsole).toHaveBeenCalledTimes(0)
  })
})
