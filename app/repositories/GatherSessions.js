const { getDB } = require('../classes/Mongo')

module.exports = class GatherSessions {
  constructor () {
    this.db = getDB()
  }

  _collection () {
    return this.db.collection('gatherSessions')
  }
}
