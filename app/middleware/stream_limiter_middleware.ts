import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import type { NextFn } from '@adonisjs/core/types/http'

export default class StreamLimiterMiddleware {
  static streams = new Map<number, string[]>()
  static handlers = new Map<number, Map<string, ReturnType<typeof setTimeout>>>()

  static getIdentifier(ctx: HttpContext): string {
    const ip = ctx.request.ip()
    const userAgent = ctx.request.header('user-agent')
    const url = ctx.request.url()

    return ip + userAgent + url
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const user = await ctx.auth.authenticate()

    const identifier = await StreamLimiterMiddleware.getIdentifier(ctx)

    if (!StreamLimiterMiddleware.streams.has(user.id)) {
      StreamLimiterMiddleware.streams.set(user.id, [])
    }

    const currentStreams = StreamLimiterMiddleware.streams.get(user.id) ?? []

    if (currentStreams.length >= 3) {
      return ctx.response.forbidden({
        message: 'You have reached the maximum number of streams',
      })
    }

    if (!currentStreams.includes(identifier)) {
      currentStreams.push(identifier)
      StreamLimiterMiddleware.streams.set(user.id, currentStreams)
      logger.info('Stream added to user: %s | %s', user.email, identifier)

      if (!StreamLimiterMiddleware.handlers.has(user.id)) {
        StreamLimiterMiddleware.handlers.set(user.id, new Map())
      }

      const handlers = StreamLimiterMiddleware.handlers.get(user.id) ?? new Map()

      // Remove the identifier from the streams list after 5 minutes
      const handler = setTimeout(
        () => {
          const currentStreams = StreamLimiterMiddleware.streams.get(user.id) ?? []
          const index = currentStreams.indexOf(identifier)

          if (index !== -1) {
            currentStreams.splice(index, 1)
            StreamLimiterMiddleware.streams.set(user.id, currentStreams)
          }

          handlers.delete(identifier)
          logger.info('Stream removed from user: %s | %s', user.email, identifier)
        },
        5 * 60 * 1000
      )

      handlers.set(identifier, handler)
      StreamLimiterMiddleware.handlers.set(user.id, handlers)
    }

    return await next()
  }
}
