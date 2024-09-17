import { Roles } from '#models/user'
import { Memory } from '#tests/utils'
import { cuid } from '@adonisjs/core/helpers'
import redis from '@adonisjs/redis/services/main'
import { test } from '@japa/runner'

test.group('Users', () => {
  const memory = new Memory()

  test('get user without login', async (ctx) => {
    const response = await ctx.client.get('users/1')

    response.assertStatus(401)

    response.assertBodyContains({
      errors: [
        {
          message: 'Unauthorized access',
        },
      ],
    })
  })

  test('get user by valid id with login', async (ctx) => {
    const loginResponse = await ctx.client.post('auth/login').json({
      email: 'admin@example.com',
      password: 'admin123',
    })

    memory.set('admin-token', loginResponse.body().token)

    const token = loginResponse.body().token

    const response = await ctx.client.get('users/1').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('get user by invalid id with login', async (ctx) => {
    const token = memory.get('admin-token')

    const response = await ctx.client
      .get('users/' + Number.MAX_SAFE_INTEGER)
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(404)
  })

  test('create user as admin', async (ctx) => {
    const token = memory.get('admin-token')

    const response = await ctx.client
      .post('auth/register')
      .json({
        email: 'user@example.com',
        password: 'test123',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('create admin as admin', async (ctx) => {
    const token = memory.get('admin-token')

    const response = await ctx.client
      .post('auth/register')
      .json({
        email: 'admin2@example.com',
        password: 'test123',
        role: Roles.admin,
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('create admin as user', async (ctx) => {
    const loginResponse = await ctx.client.post('auth/login').json({
      email: 'user@example.com',
      password: 'test123',
    })

    memory.set('user-token', loginResponse.body().token)

    const token = loginResponse.body().token

    const response = await ctx.client
      .post('auth/register')
      .json({
        email: 'user2@example.com',
        password: 'test123',
        role: Roles.admin,
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('create user with existing email', async (ctx) => {
    const response = await ctx.client.post('auth/register').json({
      email: 'user@example.com',
      password: 'test123',
    })

    response.assertStatus(400)
  })

  test('create user with invalid password', async (ctx) => {
    const response = await ctx.client.post('auth/register').json({
      email: cuid() + '@example.com',
      password: '123',
    })

    response.assertStatus(422)
  })

  test('create user with invalid role', async (ctx) => {
    const response = await ctx.client.post('auth/register').json({
      email: cuid() + '@example.com',
      password: 'test123',
      role: 'invalid',
    })

    response.assertStatus(422)
  })

  test('update self maxStreams as user', async (ctx) => {
    const token = memory.get('user-token')

    const response = await ctx.client
      .patch('users/me')
      .json({
        maxStreams: 5,
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('update self maxStreams as admin', async (ctx) => {
    const token = memory.get('admin-token')

    const response = await ctx.client
      .patch('users/me')
      .json({
        maxStreams: 5,
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('update maxStreams when theres more currentStreams than maxStreams', async (ctx) => {
    const token = memory.get<string>('admin-token')

    const me = await ctx.client.get('users/me').header('Authorization', `Bearer ${token}`)
    const id = me.body()['id']

    const key = `user:${id}:streams:${cuid()}`

    await redis.set(key, 'active')

    const response = await ctx.client
      .patch('users/me')
      .json({
        maxStreams: 0,
      })
      .header('Authorization', `Bearer ${token}`)

    await redis.expire(key, 0)

    response.assertStatus(400)
  })

  test('update maxStreams when theres more maxStreams than currentStreams', async (ctx) => {
    const token = memory.get<string>('admin-token')

    const me = await ctx.client.get('users/me').header('Authorization', `Bearer ${token}`)
    const id = me.body()['id']

    const key = `user:${id}:streams:${cuid()}`

    await redis.set(key, 'active')

    const response = await ctx.client
      .patch('users/me')
      .json({
        maxStreams: 999,
      })
      .header('Authorization', `Bearer ${token}`)

    await redis.expire(key, 0)

    response.assertStatus(200)
  })

  test('update user as user', async (ctx) => {
    const token = memory.get<string>('user-token')

    const response = await ctx.client
      .patch('users/1')
      .json({
        email: cuid() + 'example.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(403)
  })

  test('update self as user', async (ctx) => {
    const token = memory.get<string>('user-token')

    const response = await ctx.client
      .patch('users/me')
      .json({
        email: 'updated-user@example.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('update user as admin', async (ctx) => {
    const token = memory.get<string>('admin-token')

    const response = await ctx.client
      .patch('users/1')
      .json({
        email: 'updated-by-admin@example.com',
      })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
  })

  test('list users', async (ctx) => {
    const adminToken = memory.get<string>('admin-token')
    const userToken = memory.get<string>('user-token')

    const responseAsUser = await ctx.client
      .get('users')
      .header('Authorization', `Bearer ${userToken}`)
    const responseAsAdmin = await ctx.client
      .get('users')
      .header('Authorization', `Bearer ${adminToken}`)

    responseAsUser.assertStatus(403)
    responseAsAdmin.assertStatus(200)
  })
})
