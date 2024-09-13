import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import type { NextFn } from '@adonisjs/core/types/http'

export default class StreamLimiterMiddleware {
  // TODO: Redis
  static streams: Map<number, string[]> = new Map()
  static handles: Map<number, ReturnType<typeof setTimeout>> = new Map()

  async getIdentifier(ctx: HttpContext, user: User) {
    const id = user.id

    const deviceId = ctx.request.cookie('x-device-id', cuid())

    ctx.response.cookie('x-device-id', deviceId, {
      httpOnly: true,
      sameSite: 'strict',
    })

    const userAgent = ctx.request.header('user-agent')
    const ip = ctx.request.ip()

    logger.info(
      `User ${id} with device id ${deviceId} and user agent ${userAgent} and ip ${ip}, x-device-id ${ctx.request.cookie('x-device-id')}`
    )

    return [id, userAgent, ip, deviceId].join(':')
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const user = await ctx.auth.authenticate()

    const identifier = await this.getIdentifier(ctx, user)

    const streams = StreamLimiterMiddleware.streams.get(user.id) ?? []

    if (!streams.includes(identifier)) {
      streams.push(identifier)
    }

    if (streams.length > user.maxStreams) {
      return ctx.response.unauthorized({
        message: 'You have reached the maximum number of streams',
      })
    }

    logger.info(`streams: ${streams.length}`)

    StreamLimiterMiddleware.streams.set(user.id, streams)

    const oldHandle = StreamLimiterMiddleware.handles.get(user.id)

    const handle = setTimeout(
      () => {
        const streams = StreamLimiterMiddleware.streams.get(user.id) ?? []

        const index = streams.indexOf(identifier)

        if (index !== -1) {
          streams.splice(index, 1)

          StreamLimiterMiddleware.streams.set(user.id, streams)
        }

        logger.info(`User ${user.id} stopped stream with identifier ${identifier}`)
      },
      1000 * 60 * 1 // 1 minutes
    )

    if (!oldHandle) {
      logger.info(`User ${user.id} started stream with identifier ${identifier}`)
    }

    if (oldHandle) {
      clearTimeout(oldHandle)
    }

    StreamLimiterMiddleware.handles.set(user.id, handle)

    return await next()
  }
}
