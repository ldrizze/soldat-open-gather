module.exports = class Context {
  constructor (user, channel, message, targetUser) {
    this.message = message
    this.user = user
    this.channel = channel
    this.targetUser = targetUser
  }

  validate (roles) {
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

  _validateCommandRole (command) {
    // TODO Find informations about user role in DB
    return true
  }
}
