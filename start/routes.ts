/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

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
  })
  .prefix('api/v1')
