import vine from '@vinejs/vine'

export const createVideoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),

    thumbnail: vine.file({
      size: '100mb',
      extnames: ['jpg', 'png'],
    }),

    video: vine.file({
      size: '1gb',
      extnames: ['mp4', 'avi', 'mkv'],
    }),
  })
)
