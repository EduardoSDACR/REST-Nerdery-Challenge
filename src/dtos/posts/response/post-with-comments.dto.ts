import { Exclude, Expose, Transform } from 'class-transformer'
import { BaseDto } from '../../base.dto'
import { CommentDto } from '../../comments/response/comment.dto'

@Exclude()
export class PostWithCommentsDto extends BaseDto {
  @Expose()
  readonly id: number

  @Expose()
  readonly title: string

  @Expose()
  readonly published: boolean

  @Expose()
  readonly authorId: number

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

  @Expose()
  readonly comments: CommentDto[]
}
