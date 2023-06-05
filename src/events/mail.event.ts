import { NodemailerService } from '../services/nodemailer.service'
import { AccountsService } from '../services/accounts.service'

export const USER_EMAIL_CONFIRMATION = Symbol('USER_EMAIL_CONFIRMATION')

type userEmailConfirmationType = {
  email: string
  userId: number
}

export async function userEmailConfirmationEvent({
  email,
  userId,
}: userEmailConfirmationType): Promise<void> {
  const token = AccountsService.generateEmailConfirmationToken(userId)

  try {
    await NodemailerService.sendEmail({
      to: email,
      subject: 'Confirm Account',
      text: 'Please confirm your email',
      html: `<strong>Token: ${token}</strong>`,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}
