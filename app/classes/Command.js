import Config from '../config'

class Command {
  constructor (command, role, fn) {
    this.command = `${Config.commandPrefix}${command}`
    this.role = role
    this.fn = fn
  }
}

export { Command }
