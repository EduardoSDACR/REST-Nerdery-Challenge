import { Exclude, Expose, Transform } from 'class-transformer'
import { BaseDto } from '../../base.dto'

@Exclude()
export class CommentDto extends BaseDto {
  @Expose()
  readonly id: number

  @Expose()
  readonly content: string

  @Expose()
  readonly published: boolean

  @Expose()
  readonly authorId: number

  @Expose()
  readonly postId: number

  @Expose()
  readonly likes: number

  @Expose()
  readonly dislikes: number

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly createdAt: Date

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly updatedAt: Date
}
