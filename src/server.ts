import express, { Application, Request, Response } from 'express'
import { serve, setup } from 'swagger-ui-express'
import './middlewares/passport'
import passport from 'passport'
import { documentation } from './swagger'
import { router } from './router'
import { errorHandler } from './middlewares/error-handler'
import { initEvents } from './events'

class App {
  app: Application

  constructor() {
    this.app = express()
    this.settings()
    this.middlewares()
    this.routes()
  }

  private settings() {
    this.app.set('port', process.env.PORT || 3000)
    this.app.set('environment', process.env.ENVIRONMENT || 'dev')
  }

  private middlewares() {
    this.app.use(passport.initialize())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
  }

  private routes() {
    this.app.use('/api-docs', serve, setup(documentation, { explorer: true }))
    this.app.use('/', router(this.app))
    this.app.get('/api/v1/status', (req: Request, res: Response) => {
      res.json({
        time: new Date(),
      })
    })
    this.app.use(errorHandler)
  }

  async listen(): Promise<void> {
    await this.app.listen(this.app.get('port'))
    // eslint-disable-next-line no-console
    console.log(
      `Server listening on port %d, env: %s`,
      this.app.get('port'),
      this.app.get('environment'),
    )
    initEvents()
  }
}

const app = new App()
app.listen()
