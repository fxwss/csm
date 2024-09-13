import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeSave, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { type HasMany } from '@adonisjs/lucid/types/relations'
import Video from '#models/video'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export const Roles = {
  admin: 'admin',
  user: 'user',
} as const

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare maxStreams: number

  @column()
  declare role: keyof typeof Roles

  @column({ serializeAs: null })
  declare password: string

  @hasMany(() => Video)
  declare videos: HasMany<typeof Video>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)

  @beforeSave()
  public static async verifyRole(user: User) {
    const roles = Object.values(Roles)

    if (!user.role) {
      user.role = Roles.user
    }

    if (!roles.includes(user.role)) {
      throw new Error('Invalid role')
    }
  }
}
