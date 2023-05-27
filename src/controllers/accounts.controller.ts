import { Request, Response } from 'express'
import { plainToClass } from 'class-transformer'
import { AccountsService } from '../services/accounts.service'
import { LoginDto } from '../dtos/accounts/request/login.dto'
export async function login(req: Request, res: Response): Promise<void> {
  const dto = plainToClass(LoginDto, req.body)
  const result = await AccountsService.login(dto)
  res.status(200).json(result)
}
