const { getDB } = require('../classes/Mongo')
const moment = require('moment')

module.exports = class Users {
  constructor () {
    this.db = getDB()
  }

  async create (userId, pin, steamId = '') {
    return this._collection().insertOne({
      userId, pin, steamId, auth: false, pinExpires: this._pinExpirationTimestamp()
    })
  }

  async find (userId) {
    const user = await this._collection().find({ userId }).limit(1).toArray()
    return user.length > 0 ? user[0] : null
  }

  async get (filter) {
    return this._collection().find(filter).toArray()
  }

  async findBySteamId (steamId) {
    const user = await this._collection().find({ steamId }).limit(1).toArray()
    return user.length > 0 ? user : null
  }

  async isAuthenticated (userId, steamId) {
    const user = await this._collection().find({ userId, steamId, auth: true }).limit(1).toArray()
    return user.length > 0
  }

  async getUnauthenticatedByPin (pin) {
    return this._collection().find({ pin, auth: false }).toArray()
  }

  async newPin (userId, pin) {
    const user = await this.find(userId)
    if (user) {
      return this._collection().updateOne({ userId }, { $set: { pin, pinExpires: this._pinExpirationTimestamp() } })
    }
  }

  async authenticate (userId, pin, steamId) {
    if (pin === -1) return false // prevent fake auth
    const user = await this.find(userId)
    if (user) {
      await this._collection().updateOne({ userId, pin }, {
        $set: { steamId, auth: true }
      })
      return true
    }
    return false
  }

  _pinExpirationTimestamp () {
    return moment().add('5 minutes').unix()
  }

  _collection () {
    return this.db.collection('users')
  }
}
