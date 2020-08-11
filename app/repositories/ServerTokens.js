const { getDB } = require('../classes/Mongo')
const uuid = require('uuid').v4

module.exports = class ServerTokens {
  constructor () {
    this.db = getDB()
  }

  async generate (role) {
    const token = uuid()
    await this._collection().insertOne({
      token,
      role
    })
    return token
  }

  async find (token) {
    const st = await this._collection().find({ token }).limit(1).toArray()
    return st.length > 0 ? st[0] : null
  }

  _collection () {
    return this.db.collection('serverTokens')
  }
}
