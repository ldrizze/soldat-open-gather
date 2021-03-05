const { getDB } = require('../classes/Mongo')
const moment = require('moment')
const uuid = require('uuid').v4

module.exports = class ClanWarSessions {
  constructor () {
    this.db = getDB()
  }

  async findOpenedSession (callerId) {
    return this._collection().find({ callerId, startedAt: null }).limit(1).toArray()
  }

  async create (callerId) {
    return this._collection().insertOne({
      callerId,
      oponentId: '',
      createdAt: moment().unix(),
      startedAt: null,
      finishedAt: null,
      sessionId: uuid()
    })
  }

  _collection () {
    return this.db.collection('clanWarSessions')
  }
}
