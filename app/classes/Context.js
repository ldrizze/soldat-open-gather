module.exports = class Context {
  constructor (user, channel, message) {
    this.message = message
    this.user = user
    this.channel = channel
  }

  async validate () {
    const command = this._validateCommands()
    if (command) {
      if (this._validateCommandRole(command)) return command
    }
  }

  /**
   * Validate internal commands
   * @returns Command
   */
  _validateCommands () {
    if (this.commands) {
      const optin = this.message.split(' ')
      for (const command of this.commands) {
        if (command.command === optin[0]) return command
      }
    }
  }

  _validateCommandRole (command, role) {
    if (command.role instanceof Array) {
      return command.role.indexOf(role) !== -1
    } else if (typeof command.role === 'string') {
      return role === command.role
    }
    return false
  }
}
