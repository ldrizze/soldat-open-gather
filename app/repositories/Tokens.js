const { getDB } = require('../classes/Mongo')

module.exports = class Tokens {
  constructor () {
    this.db = getDB()
  }
}
