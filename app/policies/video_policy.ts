import User, { Roles } from '#models/user'
import { BasePolicy } from '@adonisjs/bouncer'
import { AuthorizerResponse } from '@adonisjs/bouncer/types'

export default class VideoPolicy extends BasePolicy {
  create(user: User): AuthorizerResponse {
    // Only admins can create videos
    if (user.role !== Roles.admin) {
      return false
    }

    return true
  }

  update(user: User): AuthorizerResponse {
    // Only admins can update videos
    if (user.role !== Roles.admin) {
      return false
    }

    return true
  }

  delete(user: User): AuthorizerResponse {
    // Only admins can delete videos
    if (user.role !== Roles.admin) {
      return false
    }

    return true
  }
}
