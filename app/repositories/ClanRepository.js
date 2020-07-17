
const { getDB } = require('../classes/Mongo')
const slugify = require('slugify')

module.exports = class ClanRepository {
  constructor () {
    this.db = getDB()
  }

  async find (slug) {
    const clan =
      await this.db.collection('clans').find({ slug: slug }).limit(1).toArray()

    if (clan.length > 0) {
      return clan[0]
    }

    return null
  }

  async delete (slug) {
    return this.db.collection('clans').deleteOne({ slug })
  }

  async create (name, channel, role, addedBy) {
    return this.db.collection('clans').insertOne({
      name, channel, role, addedBy, slug: slugify(name)
    })
  }

  async findByChannel (channel) {
    const clan =
      await this.db.collection('clans').find({ channel }).limit(1).toArray()

    if (clan.length > 0) {
      return clan[0]
    }

    return null
  }

  async findByRole (role) {
    const clan =
      await this.db.collection('clans').find({ role }).limit(1).toArray()

    if (clan.length > 0) {
      return clan[0]
    }

    return null
  }

  async update (slug, fields) {
    return this.db.collection('clans').updateOne({ slug }, { $set: fields })
  }
}
