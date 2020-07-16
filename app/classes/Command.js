const Config = require('../config')

module.exports = class Command {
  constructor (command, role, fn) {
    this.command = `${Config.commandPrefix}${command}`
    this.role = role
    this.fn = fn
  }
}
