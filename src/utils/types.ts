export type EmailType = {
  to: string
  subject: string
  text?: string
  html: string
}

export type Authenticated = {
  id: number
  email: string
  role: string
}
