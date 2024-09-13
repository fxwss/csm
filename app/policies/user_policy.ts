import User, { Roles } from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  update(user: User, other: User): AuthorizerResponse {
    // Only admins can update other users
    // Or users can update themselves
    if (user.role !== Roles.admin && user.id !== other.id) {
      return false
    }

    return true
  }

  delete(user: User, other: User): AuthorizerResponse {
    // Only admins can delete other users
    // Or users can delete themselves
    if (user.role !== Roles.admin && user.id !== other.id) {
      return false
    }

    return true
  }
}
