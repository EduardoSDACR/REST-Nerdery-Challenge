import { Exclude, Expose } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class UpdateCommentDto extends BaseDto {
  @Expose()
  @IsString()
  @IsOptional()
  readonly content?: string

  @Expose()
  @IsBoolean()
  @IsOptional()
  readonly published?: boolean
}
