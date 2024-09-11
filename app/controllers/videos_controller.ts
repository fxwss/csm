import Video from '#models/video'
import { createVideoValidator } from '#validators/video'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import fs from 'node:fs'

export default class VideosController {
  // return video list paginated
  async index(ctx: HttpContext) {
    const page = ctx.request.input('page', 1)
    const limit = ctx.request.input('limit', 10)

    return await Video.query().paginate(page, limit)
  }

  async store(ctx: HttpContext) {
    const payload = await ctx.request.validateUsing(createVideoValidator)

    const name = cuid()

    const videoStoragePath = 'storage/video'
    const thumbnailStoragePath = 'storage/thumbnail'

    const videoExt = payload.video.extname
    const thumbnailExt = payload.thumbnail.extname

    const videoName = `${name}.${videoExt}`
    const thumbnailName = `${name}.${thumbnailExt}`

    const videoPath = `${videoStoragePath}/${name}.${videoExt}`
    const thumbnailPath = `${thumbnailStoragePath}/${name}.${thumbnailExt}`

    payload.video.move(videoStoragePath, {
      name: videoName,
    })

    payload.thumbnail.move(thumbnailStoragePath, {
      name: thumbnailName,
    })

    return await Video.create({
      title: payload.title,
      videoPath,
      thumbnailPath,
    })
  }

  async stream(ctx: HttpContext) {
    const range = ctx.request.header('Range')

    if (!range) {
      return ctx.response.badRequest({ message: 'Range header is required' })
    }

    const video = await Video.findOrFail(ctx.params.id)

    if (!video) {
      return ctx.response.notFound({ message: 'Video not found' })
    }

    const { size } = fs.statSync(video.videoPath)

    const parts = range.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : size - 1
    const chunksize = end - start + 1

    ctx.response.header('Content-Range', `bytes ${start}-${end}/${size}`)
    ctx.response.header('Accept-Ranges', 'bytes')
    ctx.response.header('Content-Length', chunksize)
    ctx.response.header('Content-Type', 'application/octet-stream')
    ctx.response.header('Connection', 'keep-alive')
    ctx.response.header('Cache-Control', 'no-cache')
    ctx.response.header('Pragma', 'no-cache')

    // Send stream data
    ctx.response.status(206).stream(fs.createReadStream(video.videoPath, { start, end }))
  }

  async show(ctx: HttpContext) {
    const video = await Video.findOrFail(ctx.params.id)

    if (!video) {
      return ctx.response.notFound({ message: 'Video not found' })
    }

    const { size } = fs.statSync(video.videoPath)

    return {
      ...video.toJSON(),
      sizeInBytes: size,
    }
  }

  async update(ctx: HttpContext) {
    // code to update video
  }

  async destroy(ctx: HttpContext) {
    // code to delete video
  }
}
