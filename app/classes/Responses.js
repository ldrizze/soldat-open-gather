class Response {
  constructor (message) {
    this.message = message
  }

  toString () {
    return this.message
  }
}

class MD extends Response {}

exports.MD = MD
