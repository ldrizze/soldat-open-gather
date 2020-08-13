const { getDB } = require('../classes/Mongo')
const moment = require('moment')
const config = require('../config')
const uuid = require('uuid').v4

module.exports = class GatherServers {
  constructor () {
    this.db = getDB()
  }

  async allNotOffline () {
    return this._collection().find({
      state: { $ne: 'offline' }
    }).toArray()
  }

  async create (ip, port, name, type = 'ctf', state = 'offline') {
    return this._collection().insertOne({
      ip,
      port,
      name,
      state,
      type,
      lastUpdate: moment().unix(),
      players: [],
      sessionId: '',
      password: '123456'
    })
  }

  async delete (ip, port) {
    return this._collection().deletetOne({
      ip, port
    })
  }

  async find (ip, port) {
    const session = await this._collection().find({ ip, port }).limit(1).toArray()

    if (session.length > 0) return session[0]
  }

  async get (filter) {
    return this._collection().find(filter).toArray()
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

  async changePassword (ip, port, password) {
    return this._collection().updateOne({ ip, port }, { $set: { password } })
  }

  async removePlayer (ip, port, playerId) {
    return this._collection().updateOne(
      { ip, port }, { $pull: { players: playerId }, $set: { lastUpdate: moment().unix() } }
    )
  }

  async changeState (ip, port, state) {
    return this._collection().updateOne({ ip, port }, { $set: { state, lastUpdate: moment().unix() } })
  }

  async changeName (ip, port, name) {
    return this._collection().updateOne({ ip, port }, { $set: { name, lastUpdate: moment().unix() } })
  }

  async hearthBeat (ip, port) {
    return this._collection().updateOne({ ip, port }, { $set: { lastUpdate: moment().unix() } })
  }

  async startGame (ip, port) {
    const sessionId = uuid()
    await this._collection().updateOne({ ip, port }, {
      $set: {
        state: 'waiting_server',
        lastUpdate: moment().unix(),
        sessionId
      }
    })
    return sessionId
  }

  async endGame (ip, port) {
    await this._collection().updateOne({ ip, port }, {
      $set: {
        state: 'waiting',
        lastUpdate: moment().unix(),
        sessionId: '',
        players: []
      }
    })
  }

  async findPlayerSession (playerId) {
    const session = await this._collection().find({
      players: { $in: [playerId] }
    }).toArray()

    if (session.length > 0) return session[0]
  }

  _collection () {
    return this.db.collection('gatherServers')
  }
}
