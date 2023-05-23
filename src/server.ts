import express, { Application } from 'express'

class App {
  app: Application

  constructor() {
    this.app = express()
    this.settings()
    this.middlewares()
  }

  private settings() {
    this.app.set('port', process.env.PORT || 3000)
    this.app.set('environment', process.env.ENVIRONMENT || 'dev')
  }

  private middlewares() {
    this.app.use(express.json())
  }

  async listen(): Promise<void> {
    await this.app.listen(this.app.get('port'))
    // eslint-disable-next-line no-console
    console.log(
      `Server listening on port %d, env: %s`,
      this.app.get('port'),
      this.app.get('environment'),
    )
  }
}

const app = new App()
app.listen()
