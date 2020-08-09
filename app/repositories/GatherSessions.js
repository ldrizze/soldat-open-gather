const { getDB } = require('../classes/Mongo')
const moment = require('moment')
const config = require('../config')

module.exports = class GatherSessions {
  constructor () {
    this.db = getDB()
  }

  async create (ip, port, name) {
    return this._collection().insertOne({
      ip, port, name, state: 'unknown', lastUpdate: moment().unix(), players: []
    })
  }

  async delete (ip, port) {
    return this._collection().deletetOne({
      ip, port
    })
  }

  async find (ip, port) {
    const session = this._collection().find({ ip, port }).limit(1).toArray()

    if (session.length > 0) return session[0]
  }

  async waiting () {
    return this._collection().find({ state: 'waiting' }).toArray()
  }

  async running () {
    return this._collection().find({ state: 'running' }).toArray()
  }

  async available () {
    return this._collection().aggregate([
      {
        $match: { state: 'waiting' }
      },
      {
        $addFields: { playersCount: { $size: { $ifNull: ['$players', []] } } }
      },
      {
        $match: { playersCount: { $lt: config.game.maxplayers } }
      },
      {
        $sort: { playersCount: -1 }
      }
    ]).toArray()
  }

  async all () {
    return this._collection().find().toArray()
  }

  async addPlayer (ip, port, playerId) {
    return this._collection().updateOne({ ip, port }, { $addToSet: { players: playerId } })
  }

  async removePlayer (ip, port, playerId) {
    return this._collection().updateOne(
      { ip, port }, { $pull: { players: playerId }, $set: { lastUpdate: moment().unix() } }
    )
  }

  async changeState (ip, port, state) {
    return this._collection().updateOne({ ip, port }, { $set: { state, lastUpdate: moment().unix() } })
  }

  _collection () {
    return this.db.collection('gatherSessions')
  }
}
