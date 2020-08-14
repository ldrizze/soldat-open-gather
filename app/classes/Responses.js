class Response {
  constructor (message) {
    this.message = message
  }

  toString () {
    return this.message
  }
}

class MD extends Response {}
class Channel extends Response {
  constructor (message, channel) {
    super(message)
    this.channel = channel
  }
}

exports.MD = MD
exports.Channel = Channel
