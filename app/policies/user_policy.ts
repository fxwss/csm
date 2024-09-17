import User, { Roles } from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class UserPolicy extends BasePolicy {
  view(user: User, other: User): AuthorizerResponse {
    // Only admins can view other users
    // Or users can view themselves
    if (user.role !== Roles.admin && user.id !== other.id) {
      return false
    }

    return true
  }

  list(user: User): AuthorizerResponse {
    // Only admins can list users
    if (user.role !== Roles.admin) {
      return false
    }

    return true
  }

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
