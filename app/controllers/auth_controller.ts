import BadRequestException from '#exceptions/bad_request_exception'
import UnAuthorizedException from '#exceptions/un_authorized_exception'
import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async login({ request }: HttpContext) {
    const payload = await loginValidator.validate(request.all())

    const user = await User.query().where('email', payload.email).firstOrFail()

    if (await hash.verify(user.password, payload.password)) {
      return user
    }

    throw new UnAuthorizedException('Invalid credentials')
  }

  async register({ request }: HttpContext) {
    const payload = await registerValidator.validate(request.all())

    if (await User.query().where('email', payload.email).first()) {
      throw new BadRequestException('Email already exists')
    }

    return await User.create(payload)
  }
}
