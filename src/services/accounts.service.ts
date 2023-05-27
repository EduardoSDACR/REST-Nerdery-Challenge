import { sign } from 'jsonwebtoken'
import { Prisma, Token } from '@prisma/client'
import { NotFound, Unauthorized } from 'http-errors'
import { compareSync } from 'bcryptjs'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'
import { LoginDto } from '../dtos/accounts/request/login.dto'
import { TokenDto } from '../dtos/accounts/response/token.dto'

export class AccountsService {
  static async login(input: LoginDto): Promise<TokenDto> {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    })

    const isValid = compareSync(input.password, user.hash)

    if (!isValid) {
      throw new Unauthorized('Invalid credentials')
    }

    const token = await this.createToken(user.id)

    return this.generateAccessToken(token.jti)
  }

  static async createToken(id: number): Promise<Token> {
    try {
      return await prisma.token.create({
        data: {
          userId: id,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.FOREIGN_KEY_CONSTRAINT:
            throw new NotFound('User not found')
          default:
            throw error
        }
      }

      throw error
    }
  }

  static generateAccessToken(sub: string): TokenDto {
    const expirationDate = process.env.JWT_EXPIRATION_TIME as string
    const accessToken = sign(
      {
        sub,
      },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: expirationDate },
    )

    return {
      accessToken,
      exp: expirationDate,
    }
  }
}
