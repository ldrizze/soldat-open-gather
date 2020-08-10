const { getDB } = require('../classes/Mongo')

module.exports = class ServerTokens {
  constructor () {
    this.db = getDB()
  }
}
