import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Unauthorized } from 'http-errors'
import { prisma } from '../prisma'

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY as string,
    },
    async (jwtPayload, done) => {
      const token = await prisma.token.findUnique({
        where: {
          jti: jwtPayload.sub,
        },
        select: {
          user: {
            select: { id: true, email: true },
          },
        },
      })

      if (!token) {
        return done(new Unauthorized('Invalid authentication'), false)
      }

      return done(null, token.user)
    },
  ),
)
