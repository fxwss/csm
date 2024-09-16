import BadRequestException from '#exceptions/bad_request_exception'
import User, { Roles } from '#models/user'
import redis from '@adonisjs/redis/services/main'
import vine from '@vinejs/vine'

export const updateUserValidator = vine.withMetaData<{ other: User }>().compile(
  vine.object({
    email: vine.string().email().optional(),
    password: vine.string().minLength(6).optional(),
    role: vine.string().in(Object.values(Roles)).optional(),
    maxStreams: vine
      .number()
      .min(0)
      .withoutDecimals()
      .transform(async (value, field) => {
        const all = `user:${field.meta.other.id}:streams:*`
        const streams = await redis.keys(all)

        if (streams.length > value) {
          throw new BadRequestException('Max streams cannot be less than current streams')
        }

        return value
      })
      .optional(),
  })
)
