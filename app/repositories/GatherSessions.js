const { getDB } = require('../classes/Mongo')

module.exports = class GatherSessions {
  constructor () {
    this.db = getDB()
    this.mapsInfoStructure = {
      mapName: '',
      score: {
        alpha: 0,
        bravo: 0
      },
      playersScore: []
    }
  }

  async create (sessionId, alpha, bravo) {
    return this._collection().insertOne({
      sessionId,
      players: {
        alpha,
        bravo
      },
      maps: {
        alpha: this.mapsInfoStructure,
        bravo: this.mapsInfoStructure,
        tie: this.mapsInfoStructure
      },
      rounds: 0
    })
  }

  async find (sessionId) {
    const session = await this._collection().find({ sessionId }).toArray()
    return session.length > 0 ? session[0] : null
  }

  async insertScores (sessionId, team, map, scores, rounds, playerScores) {
    const sets = {}
    sets[`maps.${team}.score`] = scores
    sets[`maps.${team}.mapName`] = map
    sets[`maps.${team}.playersScore`] = playerScores
    sets.rounds = rounds
    return this._collection().updateOne({ sessionId }, { $set: sets })
  }

  _collection () {
    return this.db.collection('gatherSessions')
  }
}
