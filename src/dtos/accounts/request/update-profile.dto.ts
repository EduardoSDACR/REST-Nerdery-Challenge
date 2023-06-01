import { Exclude, Expose } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class UpdateProfileDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly nick?: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly name?: string

  @Expose()
  @IsEmail()
  @IsOptional()
  readonly email?: string

  @Expose()
  @IsBoolean()
  @IsOptional()
  readonly publicName?: boolean

  @Expose()
  @IsBoolean()
  @IsOptional()
  readonly publicEmail?: boolean
}
