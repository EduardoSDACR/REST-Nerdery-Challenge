import { Exclude, Expose } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class CreateCommentDto extends BaseDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly content: string

  @Expose()
  @IsBoolean()
  readonly published?: boolean

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  readonly postId: number
}
