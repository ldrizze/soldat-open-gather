const Context = require('../classes/Context')
const Command = require('../classes/Command')
const Logger = require('../classes/Logger')
const ClanRepository = require('../repositories/ClanRepository')
const {
  AlreadyMember, ClanNotFound,
  NotClanMember
} = require('../classes/Errors')
const { operation } = require('../classes/Mongo')
const slugify = require('slugify')
const config = require('../config')

module.exports = class ClanAdministration extends Context {
  constructor (user, channel, message, targetUser) {
    super(user, channel, message, targetUser)

    // Commands for ClanAdministration Context
    this.commands = [
      new Command('add', ['clanlead'], this._addMember.bind(this)),
      new Command('addlead', ['clanlead', 'clanadmin'], this._addLead.bind(this)),
      new Command('addclan', ['clanadmin'], this._addClan.bind(this)),
      new Command('removeclan', ['clanadmin'], this._removeClan.bind(this)),
      new Command('remove', ['clanlead', 'clanadmin'], this._removeMember.bind(this))
    ]

    this.log = new Logger('ClanAdministration')
    this.clanRepository = new ClanRepository()
  }

  /**
   * Validate Context
   * @public
   * @returns Command|null
   */
  async validate (roles) {
    const command = this._validateCommands()
    if (command) {
      // Validate command roles
      if (command.role) {
        const userRoles = []
        for (const configRole in config.roles) {
          for (const role of roles) {
            if (role === config.roles[configRole]) userRoles.push(configRole)
          }
        }

        if (userRoles.length === 0) return null
        else {
          let shouldEnd = true
          for (const userRole in userRoles) {
            if (this._validateCommandRole(userRole)) shouldEnd = false
          }
          if (shouldEnd) return null
        }
      }

      // Validate command channel
      if (command.commandName === 'add' || command.commandName === 'remove') {
        this.clan = await this.clanRepository.findByChannel(this.channel)
        if (!this.clan) return null
        if (this.clan.members.indexOf(this.user) === -1) return null
      }

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
          channel: this.channel,
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

          if (clan.leads.indexOf(this.targetUser) !== -1) {
            return reject(new Error('Esse usuário já é líder!'))
          } else if (clan.members.indexOf(this.targetUser) !== -1) {
            const memberIndex = clan.members.indexOf(this.targetUser)
            clan.members.splice(memberIndex, 1) // Remove from clan member and add to lead
          }

          clan.leads.push(this.targetUser)
          this.log.i(`Updating clan information to: ${JSON.stringify(clan)}`)
          collection.updateOne({ slug: clan.slug }, { $set: { leads: clan.leads } }, (error, result) => {
            this.log.d(result)
            this.log.d(error)
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
  async _addMember () {
    const clan =
      await this.clanRepository.findByLead(
        this.user
      ).catch(() => false)

    if (clan) {
      if (clan.members.indexOf(this.targetUser) === -1) {
        clan.members.push(this.targetUser)
        await this.clanRepository.update(clan.slug, { members: clan.members })
        return 'Membro adicionado ao clã!'
      } else {
        throw new AlreadyMember()
      }
    } else {
      throw new ClanNotFound()
    }
  }

  /**
   * Remove a member from a clan
   * @private
   * @returns string
   */
  async _removeMember () {
    const clan =
      await this.clanRepository.findByLead(
        this.user
      ).catch(() => false)

    if (clan) {
      if (clan.members.indexOf(this.targetUser) !== -1) {
        const index = clan.members.indexOf(this.targetUser)
        clan.members.splice(index, 1)
        await this.clanRepository.update(clan.slug, { members: clan.members })

        return 'Membro removido!'
      } else {
        throw new NotClanMember()
      }
    } else {
      throw new ClanNotFound()
    }
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
