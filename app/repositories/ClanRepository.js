
const { operation, getDB } = require('../classes/Mongo')

module.exports = class ClanRepository {
  constructor () {
    this.db = getDB()
  }

  find (slug) {
    return new Promise((resolve, reject) => {
      operation((db) => {
        const collection = db.collection('clans')
        collection.find({
          slug: slug
        }).toArray((error, result) => {
          if (error) return reject(error)
          const clan = result[0]
          resolve(clan)
        })
      })
    })
  }

  async findByMember (userId) {
    const clan =
      await this.db.collection('clans').find({ members: userId }).limit(1).toArray()

    if (clan.length > 0) {
      return clan[0]
    }

    return null
  }

  async findByLead (userId) {
    const clan =
      await this.db.collection('clans').find({ leads: userId }).limit(1).toArray()

    if (clan.length > 0) {
      return clan[0]
    }

    return null
  }

  async findByChannel (channel) {
    const clan =
      await this.db.collection('clans').find({ channel }).limit(1).toArray()

    if (clan.length > 0) {
      return clan[0]
    }

    return null
  }

  async update (slug, fields) {
    return this.db.collection('clans').updateOne({ slug }, { $set: fields })
  }
}
