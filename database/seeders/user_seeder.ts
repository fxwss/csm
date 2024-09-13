import User, { Roles } from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      role: Roles.admin,
    })
  }
}
