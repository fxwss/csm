import Video from '#models/video'
import { createVideoValidator } from '#validators/video'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'node:fs'

function renameSegmentFiles(videoStoragePath: string, name: string) {
  const list = fs.readdirSync(videoStoragePath)

  for (const file of list) {
    if (!file.endsWith('.ts')) {
      continue
    }

    const filePath = `${videoStoragePath}/${file}`
    const newFilePath = `${videoStoragePath}/${file.replace(name, '')}`

    fs.existsSync(filePath) && fs.renameSync(filePath, newFilePath)
  }
}

export default class VideosController {
  // return video list paginated
  async index(ctx: HttpContext) {
    const page = ctx.request.input('page', 1)
    const limit = ctx.request.input('limit', 10)

    return await Video.query().paginate(page, limit)
  }

  async store(ctx: HttpContext) {
    // set timeout
    ctx.request.request.setTimeout(0)
    ctx.response.response.setTimeout(0)

    const payload = await ctx.request.validateUsing(createVideoValidator)

    const name = cuid()
    const videoStoragePath = `storage/video/${name}`

    const videoExt = payload.video.extname
    const thumbnailExt = payload.thumbnail.extname

    const videoName = `${name}.${videoExt}`
    const thumbnailName = `${name}.${thumbnailExt}`

    const videoPath = `${videoStoragePath}/${name}.${videoExt}`

    // Save original files
    await payload.video.move(videoStoragePath, {
      name: videoName,
    })

    await payload.thumbnail.move(videoStoragePath, {
      name: thumbnailName,
    })

    return await new Promise((resolve, reject) => {
      // Convert to HLS (HTTP Live Streaming) format
      ffmpeg(videoPath)
        .output(`${videoStoragePath}/${name}.m3u8`)
        .addOptions([
          '-hls_time 60', // Duration of each segment (60 seconds)
          '-hls_list_size 0', // Include all segments in the playlist
          '-f hls', // Format the output as HLS
        ])
        .on('end', async () => {
          logger.info('Conversion ended for video %s', videoPath)

          renameSegmentFiles(videoStoragePath, name)

          resolve(await Video.create({ title: payload.title, name }))
        })
        .on('error', (err) => {
          logger.error(err)
          reject(ctx.response.internalServerError({ message: 'Error during HLS conversion' }))
        })
        .on('progress', (progress) => {
          logger.info(`Processing: ${progress.percent?.toFixed(2)}% done for video ${videoPath}`)
        })
        .run()
    })
  }

  async playlist(ctx: HttpContext) {
    const video = await Video.findOrFail(ctx.params.id)

    if (!video) {
      return ctx.response.notFound({ message: 'Video not found' })
    }

    const videoPath = `storage/video/${video.name}/${video.name}.m3u8`

    return ctx.response.download(videoPath)
  }

  async segment(ctx: HttpContext) {
    const video = await Video.findOrFail(ctx.params.id)

    if (!video) {
      return ctx.response.notFound({ message: 'Video not found' })
    }

    const segment = (ctx.params.segment as string).replace(video.name, '')
    const segmentPath = `storage/video/${video.name}/${segment}`

    if (!fs.existsSync(segmentPath)) {
      return ctx.response.notFound({ message: 'Segment not found' })
    }

    logger.info('Serving segment %s for video %s', segment.replace('.ts', ''), video.id)

    return ctx.response.download(segmentPath)
  }

  async update(ctx: HttpContext) {
    // code to update video
  }

  async destroy(ctx: HttpContext) {
    // code to delete video
  }
}
