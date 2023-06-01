import { Request, Response } from 'express'
import { plainToInstance } from 'class-transformer'
import { AccountsService } from '../services/accounts.service'
import { LoginDto } from '../dtos/accounts/request/login.dto'
import { SignupDto } from '../dtos/accounts/request/signup.dto'
import { Authenticated } from '../utils/types'
import { UpdateProfileDto } from '../dtos/accounts/request/update-profile.dto'

export async function login(req: Request, res: Response): Promise<void> {
  const dto = plainToInstance(LoginDto, req.body)
  await dto.isValid()

  const result = await AccountsService.login(dto)

  res.status(200).json(result)
}

export async function signup(req: Request, res: Response): Promise<void> {
  const dto = plainToInstance(SignupDto, req.body)
  await dto.isValid()

  const result = await AccountsService.signup(dto)

  res.status(201).json(result)
}

export async function logout(req: Request, res: Response): Promise<void> {
  const accessToken = req.headers.authorization?.replace('Bearer ', '')

  await AccountsService.logout(accessToken)

  res.status(204).send()
}

export async function findAccountPosts(
  req: Request,
  res: Response,
): Promise<void> {
  const result = await AccountsService.findAccountPosts(
    parseInt(req.params.accountId),
  )
  res.status(200).json(result)
}

export async function profile(req: Request, res: Response): Promise<void> {
  const user = req.user as Authenticated
  const result = await AccountsService.profile(user.id)

  res.status(200).json(result)
}

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const dto = plainToInstance(UpdateProfileDto, req.body)
  await dto.isValid()
  const user = req.user as Authenticated

  const result = await AccountsService.updateProfile(user.id, dto)

  res.status(200).json(result)
}
