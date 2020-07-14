class Context {
  constructor (user, userID, channelID, message, event) {
    this.user = user
    this.userID = userID
    this.channelID = channelID
    this.message = message
    this.event = event
  }

  validate () {
    return this._validateCommands()
  }

  _validateCommands () {

  }
}

export { Context }
