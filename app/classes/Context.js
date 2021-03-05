const config = require('../config')

module.exports = class Context {
  constructor (user, channel, message) {
    this.message = message
    this.user = user
    this.channel = channel
  }

  setBotClient (client) {
    this.botClient = client
  }

  /**
   * Simple validation of the command
   * Override this to customize the command execution validation
   */
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

  /**
   * Validate if certain role are allowed to run certain command
   * @param {string} command command string from interface
   * @param {string} role role string from interface
   */
  _validateCommandRole (command, role) {
    if (command.role instanceof Array) {
      return command.role.indexOf(role) !== -1
    } else if (typeof command.role === 'string') {
      return role === command.role
    } else if (command.role === null) return true
    return false
  }

  /**
   * Validate if multiple roles are allowed to run certain command
   * @param {string} command command string from interface
   * @param {Array<string>} roles roles array string from interface
   */
  _validateCommandRoles (command, roles) {
    for (const role of roles) {
      if (this._validateCommandRole(command, role)) return true
    }
    return false
  }

  /**
   * Normalize roles from server to system
   * @param {Array<number>} roles Roles from server
   */
  _normalizeRoles (roles) {
    const userRoles = []
    for (const configRole in config.roles) {
      for (const role of roles) {
        if (role === config.roles[configRole]) userRoles.push(configRole)
      }
    }
    return userRoles
  }
}
