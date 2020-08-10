const { getDB } = require('../classes/Mongo')

module.exports = class GatherSessions {
  constructor () {
    this.db = getDB()
  }

  async create (sessionId, alpha, bravo) {
    return this._collection().insertOne({
      sessionId,
      players: {
        alpha,
        bravo
      },
      maps: {
        alpha: '',
        bravo: '',
        tie: ''
      },
      scores: []
    })
  }

  _collection () {
    return this.db.collection('gatherSessions')
  }
}
