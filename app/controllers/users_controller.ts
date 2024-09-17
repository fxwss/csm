import { createAdmin } from '#abilities/main'
import User from '#models/user'
import UserPolicy from '#policies/user_policy'
import { updateUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index(ctx: HttpContext) {
    if (await ctx.bouncer.with(UserPolicy).denies('list')) {
      return ctx.response.forbidden({
        message: 'You are not allowed to list users',
      })
    }

    const page = ctx.request.input('page', 1)
    const limit = ctx.request.input('limit', 10)

    return await User.query().paginate(page, limit)
  }

  async show(ctx: HttpContext) {
    const user = await User.findOrFail(ctx.params.id ?? ctx.auth.user?.id)

    if (await ctx.bouncer.with(UserPolicy).denies('view', user)) {
      return ctx.response.forbidden({
        message: 'You are not allowed to view this user',
      })
    }

    return user
  }

  async update(ctx: HttpContext) {
    const otherId = ctx.params.id

    const other = await User.findBy({ id: otherId ?? ctx.auth.user?.id })

    if (!other) {
      return ctx.response.notFound({
        message: 'User not found',
      })
    }

    if (await ctx.bouncer.with(UserPolicy).denies('update', other)) {
      return ctx.response.forbidden({
        message: 'You are not allowed to update this user',
      })
    }

    const payload = await ctx.request.validateUsing(updateUserValidator, { meta: { other } })
    const maxStreams = await payload.maxStreams

    if (payload.role === 'admin' || typeof maxStreams === 'number') {
      if (await ctx.bouncer.denies(createAdmin)) {
        return ctx.response.forbidden({
          message: 'You are not allowed to update as an admin',
        })
      }
    }

    other.merge({ ...payload, maxStreams })

    await other.save()

    return other
  }

  async destroy(ctx: HttpContext) {
    const user = await User.findOrFail(ctx.params.id)

    if (await ctx.bouncer.with(UserPolicy).denies('delete', user)) {
      return ctx.response.forbidden({
        message: 'You are not allowed to delete this user',
      })
    }

    await user.delete()

    return ctx.response.noContent()
  }
}
