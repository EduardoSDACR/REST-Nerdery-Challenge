import express, { Application } from 'express'
import { serve, setup } from 'swagger-ui-express'
import './middlewares/passport'
import passport from 'passport'
import { documentation } from './swagger'
import { errorHandler } from './middlewares/error-handler'

class App {
  app: Application

  constructor() {
    this.app = express()
    this.settings()
    this.routes()
    this.middlewares()
  }

  private settings() {
    this.app.set('port', process.env.PORT || 3000)
    this.app.set('environment', process.env.ENVIRONMENT || 'dev')
  }

  private middlewares() {
    this.app.use(passport.initialize())
    this.app.use(express.json())
    this.app.use(errorHandler)
  }

  private routes() {
    this.app.use('/api-docs', serve, setup(documentation, { explorer: true }))
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
