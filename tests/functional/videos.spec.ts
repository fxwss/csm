import User from '#models/user'
import { Memory } from '#tests/utils'
import redis from '@adonisjs/redis/services/main'
import { test } from '@japa/runner'
import fs from 'fs'
import path from 'path'

import { dirname } from 'path'
import { fileURLToPath } from 'url'

test.group('Videos', () => {
  const memory = new Memory()

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)

  test('create video', async (ctx) => {
    const loginResponse = await ctx.client.post('auth/login').json({
      email: 'admin2@example.com',
      password: 'test123',
    })

    loginResponse.assertStatus(200)

    const token = loginResponse.body().token

    memory.set('token', token)

    const response = await ctx.client
      .post('videos')
      .field('title', 'Test video')
      .file('video', path.join(__dirname, '../assets/sintel_trailer.mp4'))
      .file('thumbnail', path.join(__dirname, '../assets/thumb.jpg'))
      .header('Authorization', `Bearer ${token}`)
      .timeout(1000 * 60 * 60)

    response.assertStatus(200)
  }).timeout(1000 * 60 * 60)

  test('get playlist', async (ctx) => {
    const token = memory.get('token')

    const response = await ctx.client
      .get('videos/1/playlist')
      .header('Authorization', `Bearer ${token}`)

    const playlist = response.text()

    const lines = playlist.split('\n')

    const segments = lines.filter((line) => line.endsWith('.ts'))

    ctx.assert.notEmpty(segments)

    memory.set('segments', segments)

    response.assertStatus(200)
  })

  test('get segment', async (ctx) => {
    const token = memory.get('token')

    const segment = memory.get<string[]>('segments')[0]

    const response = await ctx.client
      .get(`videos/1/${segment}`)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })
})
