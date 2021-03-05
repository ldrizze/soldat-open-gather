const Context = require('../classes/Context')
const Command = require('../classes/Command')
const Logger = require('../classes/Logger')
const ClanWarSessions = require('../repositories/ClanWarSessions')
const config = require('../config')
const ClanRepository = require('../repositories/ClanRepository')
const log = new Logger('ClanWar')

class ClanWar extends Context {
  constructor (user, channel, message) {
    super(user, channel, message)

    // Command list
    this.commands = [
      new Command('!cw', ['everyone'], this._cw.bind(this)),
      new Command('!acceptcw', ['everyone'], this._acceptcw.bind(this))
    ]

    this.clanWarSessions = new ClanWarSessions()
    this.clanRepository = new ClanRepository()
    this.params = message.split(' ')
  }

  async validate (roles) {
    const command = this._validateCommands()
    log.d('Validated command', command)

    if (command) {
      const normalizedRoles = this._normalizeRoles(roles)
      if (this._validateCommandRoles(command, normalizedRoles)) {
        if (this.channel === config.channels.gather) return command
      }
    }
  }

  async _cw (event) {
    const clanRole = event.mentions.roles.first()

    if (clanRole) {
      const clanRecord = await this.clanRepository.findByRole(clanRole)

      if (clanRecord) {
        const openedSession = await this.clanWarSessions.findOpenedSession(clanRole)

        if (!openedSession) {
          await this.clanWarSessions.create(clanRole)
          return `Sessão aberta para ${clanRecord.name}`
        } else {
          return `Uma sessão já está aberta para o clã ${clanRecord.name}`
        }
      }
    }
  }

  async _acceptcw (event) {
    const clanRole = event.mentions.roles.first()
    const oponentClan = event.mentions.roles[1]

    if (clanRole && oponentClan) {
      const clanRecord = await this.clanRepository.findByRole(clanRole)

      if (clanRecord) {
        const openedSession = await this.clanWarSessions.findOpenedSession(clanRole)

        if (openedSession) {
          // TODO prepare server and start game
        } else {
          return 'A sessão não existe, crie uma nova utilizando o comando !cw'
        }
      }
    }
  }
}

module.exports = ClanWar
