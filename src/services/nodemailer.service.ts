import nodemailer from 'nodemailer'
import { EmailType } from '../utils/types'

export class NodemailerService {
  static async sendEmail(data: EmailType): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.EMAIL_SENDER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
      },
    })

    try {
      const info = await transporter.sendMail({
        ...data,
        from: process.env.EMAIL_SENDER, // sender address
      })

      // eslint-disable-next-line no-console
      console.log(info.messageId)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }
}
