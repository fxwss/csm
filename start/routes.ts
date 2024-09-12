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
        router.post('', [UsersController, 'store'])
        router.get(':id', [UsersController, 'show'])
        router.put(':id', [UsersController, 'update'])
        router.delete(':id', [UsersController, 'destroy'])
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
        router.get(':id/playlist', [VideosController, 'playlist'])
        router.get(':id/:segment', [VideosController, 'segment'])
        router.put(':id', [VideosController, 'update'])
        router.delete(':id', [VideosController, 'destroy'])
      })
      .prefix('videos')
      // .use(
      //   middleware.auth({
      //     guards: ['api'],
      //   })
      // )
      .use(middleware.streamLimiter())
  })
  .prefix('api/v1')
