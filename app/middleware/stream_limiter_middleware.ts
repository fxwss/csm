import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class StreamLimiterMiddleware {
  // generate a nonce for every call
  async handle(ctx: HttpContext, next: NextFn) {
    // check if nonce is valid
    // if not, return 403
    // if valid, return next()

    const nonce = cuid()

    return await next()
  }
}
