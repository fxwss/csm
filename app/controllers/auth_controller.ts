import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async login(ctx: HttpContext) {
    const payload = await loginValidator.validate(ctx.request.all())

    const user = await User.query().where('email', payload.email).firstOrFail()

    if (await hash.verify(user.password, payload.password)) {
      return await User.accessTokens.create(user)
    }

    return ctx.response.badRequest({
      message: 'Invalid credentials',
    })
  }

  async register(ctx: HttpContext) {
    const payload = await registerValidator.validate(ctx.request.all())

    if (await User.query().where('email', payload.email).first()) {
      return ctx.response.badRequest({
        message: 'Email already registered',
      })
    }

    const user = await User.create(payload)
    const token = await User.accessTokens.create(user)

    return token
  }

  async logout(ctx: HttpContext) {
    const auth = await ctx.auth.authenticate()

    await User.accessTokens.delete(auth, auth.currentAccessToken.identifier)

    return ctx.response.noContent()
  }
}
