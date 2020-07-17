const Context = require('../classes/Context')
const Command = require('../classes/Command')
const Logger = require('../classes/Logger')
const ClanRepository = require('../repositories/ClanRepository')
const {
  AlreadyMember, ClanNotFound,
  NotClanMember, InvalidChannel,
  Silence
} = require('../classes/Errors')
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

        if (userRoles.length === 0) throw new Silence(this.user)
        else {
          let shouldEnd = true
          for (const userRole of userRoles) {
            if (this._validateCommandRole(command, userRole)) shouldEnd = false
          }
          if (shouldEnd) throw new Silence(this.user)
        }
      }

      // Validate command channel
      if (command.commandName === 'add' || command.commandName === 'remove') {
        this.clan = await this.clanRepository.findByChannel(this.channel)
        if (!this.clan || this.channel !== config.channels.botcommands) throw new InvalidChannel()
      }

      if (command.commandName === 'addclan' || command.commandName === 'removeclan') {
        if (this.channel !== config.channels.clanadmin) throw new InvalidChannel()
      }

      return command
    }
  }

  /**
   * Create new clan if isn't exists
   * @private
   * @return Promise<string>
   */
  async _addClan (event) {
    const name = this.message.split(' ')[1]
    const role = await event.guild.roles.create({
      data: {
        name,
        color: 'ORANGE'
      }
    })
    const channel = await event.guild.channels.create(name, {
      type: 'text',
      parent: config.channels.clancategory,
      permissionOverwrites: [
        {
          id: config.roles.everyone,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: role.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    })
    const voice = await event.guild.channels.create(name, {
      type: 'voice',
      parent: config.channels.clancategory,
      permissionOverwrites: [
        {
          id: config.roles.everyone,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: role.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    })
    await this.clanRepository.create(name, channel.id, voice.id, role.id, this.user)
    return `Clã ${name} criado com sucesso!`
  }

  /**
   * Add a new lead to a clan
   * @private
   * @returns string
   */
  async _addLead (event) {
    const member = event.mentions.members.first()
    const clanRole = event.mentions.roles.first()
    if (member && clanRole) {
      const clanExists = await this.clanRepository.findByRole(clanRole.id)
      if (clanExists) {
        const hasRole = member.roles.cache.get(clanRole)
        if (!hasRole) {
          await member.roles.add(clanRole.id)
          await member.roles.add(config.roles.clanlead)
          return `${member.displayName} foi adicionado como líder do clã ${clanRole.name}`
        } else {
          throw new AlreadyMember()
        }
      } else {
        throw new ClanNotFound()
      }
    }
  }

  /**
   * Add new member to a clan
   * @private
   * @returns string
   */
  async _addMember (event) {
    const member = event.mentions.members.first()
    const clanRole = event.mentions.roles.first()
    if (member && clanRole) {
      const clanExists = await this.clanRepository.findByRole(clanRole.id)
      if (clanExists) {
        const hasRole = member.roles.cache.get(clanRole)
        if (!hasRole) {
          await member.roles.add(clanRole)
          return `${member.displayName} agora é membro do clã ${clanRole.name}`
        } else {
          throw new AlreadyMember()
        }
      } else {
        throw new ClanNotFound()
      }
    } else {
      // TODO Wrong commands
    }
  }

  /**
   * Remove a member from a clan
   * @private
   * @returns string
   */
  async _removeMember (event) {
    const member = event.mentions.members.first()
    const clanRole = event.mentions.roles.first()

    if (member && clanRole) {
      const clanExists = await this.clanRepository.findByRole(clanRole.id)
      if (clanExists) {
        const hasRole = member.roles.cache.has(clanRole.id)
        if (hasRole) {
          await member.roles.remove(clanRole.id)
          await member.roles.remove(config.roles.clanlead).catch(this.log.e)
          return `Membro ${member.displayName} removido do clã ${clanRole.name}`
        } else {
          throw new NotClanMember()
        }
      } else {
        throw new ClanNotFound()
      }
    } else {
      // TODO Wrong commands
    }
  }

  /**
   * Remove a clan and delete all members from it
   * @private
   * @returns string
   */
  async _removeClan (event) {
    const clanRole = event.mentions.roles.first()
    if (clanRole) {
      const clan = await this.clanRepository.findByRole(clanRole.id)
      if (clan) {
        await event.guild.channels.resolve(clan.channel).delete()
        await event.guild.channels.resolve(clan.voice).delete()
        await event.guild.roles.resolve(clan.role).delete()
        await this.clanRepository.delete(clan.slug)
        return `Clã ${clan.name} removido com sucesso!`
      } else {
        throw new ClanNotFound()
      }
    } else {
      // TODO Is not a clan role
    }
  }
}
