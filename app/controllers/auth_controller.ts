import { createAdmin } from '#abilities/main'
import User, { Roles } from '#models/user'
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

    if (payload.role === Roles.admin) {
      // Capture the user that is trying to register as an admin
      // so bouncer can check if they have the ability to do so
      await ctx.auth.authenticate()

      // Check if the user has the ability to register as an admin
      if (await ctx.bouncer.denies(createAdmin)) {
        return ctx.response.forbidden({
          message: 'You are not allowed to register as an admin',
        })
      }
    }

    if (await User.query().where('email', payload.email).first()) {
      return ctx.response.badRequest({
        message: 'Email already registered',
      })
    }

    const role = payload.role as keyof typeof Roles | undefined

    const user = await User.create({ ...payload, role })
    const token = await User.accessTokens.create(user)

    return token
  }

  async logout(ctx: HttpContext) {
    const auth = await ctx.auth.authenticate()

    await User.accessTokens.delete(auth, auth.currentAccessToken.identifier)

    return ctx.response.noContent()
  }
}
