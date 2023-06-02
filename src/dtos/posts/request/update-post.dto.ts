import { Exclude, Expose } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class UpdatePostDto extends BaseDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly title?: string

  @Expose()
  @IsBoolean()
  @IsOptional()
  readonly published?: boolean
}
