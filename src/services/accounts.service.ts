import { sign, verify } from 'jsonwebtoken'
import { Prisma, Token } from '@prisma/client'
import { NotFound, Unauthorized, UnprocessableEntity } from 'http-errors'
import { compareSync, hashSync } from 'bcryptjs'
import { prisma } from '../prisma'
import { PrismaErrorEnum } from '../utils/enums'
import { LoginDto } from '../dtos/accounts/request/login.dto'
import { TokenDto } from '../dtos/accounts/response/token.dto'
import { SignupDto } from '../dtos/accounts/request/signup.dto'
import { PostDto } from '../dtos/posts/response/post.dto'
import { plainToInstance } from 'class-transformer'

export class AccountsService {
  static async login(input: LoginDto): Promise<TokenDto> {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email,
      },
    })

    if (!user) {
      throw new Unauthorized('Credentials are wrong')
    }

    const passwordIsValid = compareSync(input.password, user.hash)

    if (!passwordIsValid) {
      throw new Unauthorized('Credentials are wrong')
    }

    const token = await this.createToken(user.id)

    return this.generateAccessToken(token.jti)
  }

  static async signup({ password, ...input }: SignupDto): Promise<TokenDto> {
    const userFound = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (userFound) {
      throw new UnprocessableEntity('The email is already taken')
    }

    const user = await prisma.user.create({
      data: {
        ...input,
        hash: hashSync(password, 10),
      },
    })

    const token = await this.createToken(user.id)

    return this.generateAccessToken(token.jti)
  }

  static async logout(jwt?: string): Promise<void> {
    if (!jwt) {
      throw new Unauthorized('Authentication not provided')
    }

    try {
      const { sub } = verify(jwt, process.env.JWT_SECRET_KEY as string)

      await prisma.token.delete({
        where: {
          jti: sub as string,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case PrismaErrorEnum.NOT_FOUND:
            throw new NotFound('Session not found')
          default:
            throw error
        }
      }

      throw new Unauthorized('Invalid authentication')
    }
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

  static async findAccountPosts(accountId: number): Promise<PostDto[]> {
    const user = await prisma.user.findUnique({
      where: {
        id: accountId,
      },
    })

    if (!user) {
      throw new NotFound('Account not found')
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: accountId,
        published: true,
      },
    })

    return plainToInstance(PostDto, posts)
  }
}
