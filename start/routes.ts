/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const VideosController = () => import('#controllers/videos_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Controllers imports
const UsersController = () => import('#controllers/users_controller')
const AuthController = () => import('#controllers/auth_controller')

router
  .group(() => {
    // /auth routes
    router
      .group(() => {
        router.post('login', [AuthController, 'login'])
        router.post('register', [AuthController, 'register'])
        router.post('logout', [AuthController, 'logout']).use(
          middleware.auth({
            guards: ['api'],
          })
        )
      })
      .prefix('auth')

    // /users routes
    router
      .group(() => {
        router.get('', [UsersController, 'index'])
        router.get(':id', [UsersController, 'show']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })

        router.get('me', [UsersController, 'show'])

        router.patch(':id', [UsersController, 'update']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })

        router.patch('me', [UsersController, 'update'])

        router.delete(':id', [UsersController, 'destroy']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })
      })
      .prefix('users')
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )

    // /videos routes
    router
      .group(() => {
        router.get('', [VideosController, 'index'])
        router.post('', [VideosController, 'store'])
        router.get(':id/playlist', [VideosController, 'playlist']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })
        router.get(':id/:segment', [VideosController, 'segment']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })
        router.post(':id/stop', [VideosController, 'stopStream']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })
        router.patch(':id', [VideosController, 'update']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })
        router.delete(':id', [VideosController, 'destroy']).where('id', {
          match: /^[0-9]+$/,
          cast: (value) => Number(value),
        })
      })
      .prefix('videos')
      .use(
        middleware.auth({
          guards: ['api'],
        })
      )
  })
  .prefix('api/v1')
