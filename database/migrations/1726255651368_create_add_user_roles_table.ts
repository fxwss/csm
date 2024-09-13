import { Roles } from '#models/user'
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('role').notNullable().defaultTo(Roles.user)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
