import { Exclude, Expose } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class CreatePostDto extends BaseDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  readonly title: string

  @Expose()
  @IsBoolean()
  readonly published?: boolean
}
