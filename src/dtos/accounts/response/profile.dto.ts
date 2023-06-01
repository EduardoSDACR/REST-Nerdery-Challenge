import { Exclude, Expose } from 'class-transformer'
import { BaseDto } from '../../base.dto'

@Exclude()
export class ProfileDto extends BaseDto {
  @Expose()
  readonly nick: string

  @Expose()
  readonly name: string

  @Expose()
  readonly email: string

  @Expose()
  readonly publicName: boolean

  @Expose()
  readonly publicEmail: boolean
}
