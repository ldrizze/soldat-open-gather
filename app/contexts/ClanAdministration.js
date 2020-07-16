const Context = require('../classes/Context')
const Command = require('../classes/Command')
const Logger = require('../classes/Logger')
const { operation } = require('../classes/Mongo')
const slugify = require('slugify')
module.exports = class ClanAdministration extends Context {
  constructor (user, channel, message, targetUserId) {
    super(user, channel, message, targetUserId)

    // Commands for ClanAdministration Context
    this.commands = [
      new Command('add', 'clanlead', this._addMember),
      new Command('addlead', ['clanlead', 'clanadmin'], this._addLead.bind(this)),
      new Command('addclan', 'clanadmin', this._addClan.bind(this)),
      new Command('removeclan', 'clanadmin', this._removeClan.bind(this)),
      new Command('remove', ['clanlead', 'clanadmin'], this._removeMember)
    ]

    this.log = new Logger('ClanAdministration')
    this.targetUserId = targetUserId
  }

  /**
   * Validate Context
   * @public
   * @returns Command
   */
  validate (roles) {
    const command = this._validateCommands()
    if (command) {
      // TODO Validate if is correct channel
      return command
    }
  }

  /**
   * Create new clan if isn't exists
   * @private
   * @return Promise<string>
   */
  _addClan () {
    return new Promise((resolve, reject) => {
      operation((db) => {
        const message = this.message.split(' ')
        const collection = db.collection('clans')
        const name = message[1]
        this.log.i(`Creating new clan: ${this.user} - ${name}`)
        collection.insertOne({
          slug: slugify(name.toLowerCase()),
          name: message[1],
          added_by: this.user,
          leads: [],
          members: []
        })
        resolve('Clan has been created')
      })
    })
  }

  /**
   * Add a new lead to a clan
   * @private
   * @returns string
   */
  _addLead () {
    return new Promise((resolve, reject) => {
      operation((db) => {
        const message = this.message.split(' ')
        const name = message[1].toLowerCase()
        this.log.i(`Finding clan information: ${this.user} - ${name}`)
        const collection = db.collection('clans')
        collection.find({
          slug: slugify(name)
        }).toArray((error, result) => {
          const clan = result[0]
          if (error) return reject(new Error('Cant find clan'))
          if (!clan.leads) clan.leads = []
          clan.leads.push(this.targetUserId)
          this.log.i(`Updating clan information to: ${JSON.stringify(clan)}`)
          collection.updateOne({ slug: clan.slug }, { $set: { leads: clan.leads } }, (error, result) => {
            this.log.i(result)
            this.log.i(error)
            resolve('Lead has been added')
          })
        })
      })
    })
  }

  /**
   * Add new member to a clan
   * @private
   * @returns string
   */
  _addMember () {

  }

  /**
   * Remove a member from a clan
   * @private
   * @returns string
   */
  _removeMember () {

  }

  /**
   * Remove a clan and delete all members from it
   * @private
   * @returns string
   */
  _removeClan () {
    return new Promise((resolve, reject) => {
      operation((db) => {
        const message = this.message.split(' ')
        const collection = db.collection('clans')
        const name = message[1]
        this.log.i(`Removing clan: ${this.user} - ${name}`)
        collection.deleteMany({
          slug: slugify(name.toLowerCase())
        })
        resolve('Clan has been created')
      })
    })
  }
}
