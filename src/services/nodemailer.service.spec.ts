import faker from 'faker'
import { NodemailerService } from './nodemailer.service'

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

describe('NodemailerService', () => {
  describe('sendEmail', () => {
    it('should send a confirmation email', async () => {
      const spyConsole = jest
        .spyOn(console, 'log')
        .mockImplementation(jest.fn())

      const to = faker.internet.email()
      const text = faker.lorem.words(5)
      const subject = faker.lorem.word()

      const result = await NodemailerService.sendEmail({
        to,
        html: text,
        text,
        subject,
      })

      expect(result).toBeUndefined()
      expect(spyConsole).toBeCalledWith('Verification email sent')
    })
  })
})
