import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

export class SignupDto extends BaseDto {
  @IsString()
  readonly nick: string

  @IsString()
  readonly name: string

  @IsEmail()
  readonly email: string

  @IsNotEmpty()
  @IsString()
  readonly password: string
}
