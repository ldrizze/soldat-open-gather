const Context = require('../classes/Context')
const Command = require('../classes/Command')
// const Logger = require('../classes/Logger')
const GatherServers = require('../repositories/GatherServers')
const GatherSessions = require('../repositories/GatherSessions')
const ServerTokens = require('../repositories/ServerTokens')
const Users = require('../repositories/Users')
const config = require('../config')
// const log = new Logger('Server')

class Gather extends Context {
  constructor (user, channel, message) {
    super(user, channel, message)

    // Commands
    this.commands = [
      new Command('breathe', ['server'], this._breathe.bind(this)),
      new Command('round', ['server'], this._round.bind(this)),
      new Command('playerauth', ['server'], this._playerauth.bind(this)),
      new Command('checkplayerauth', ['server'], this._checkPlayerAuth.bind(this)),
      new Command('serverready', ['server'], this._serverReady.bind(this)),
      new Command('tiebreakmap', ['server'], this._tiebreakmap.bind(this)),
      new Command('createsub', ['server'], this._createsub.bind(this)),
      new Command('callsub', ['server'], this._callsub.bind(this)),
      new Command('suboff', ['server'], this._suboff.bind(this))
    ]

    // Vars
    this.gatherRepository = new GatherServers()
    this.gatherSessionsRepository = new GatherSessions()
    this.serverTokensRepository = new ServerTokens()
    this.usersRepository = new Users()
    this.params = message.split(' ')
  }

  async validate (roles) {
    const command = this._validateCommands()

    if (command) {
      const normalizedRoles = this._normalizeRoles(roles)
      if (this._validateCommandRoles(command, normalizedRoles)) {
        if (this.channel === config.channels.gather) return command
      }
    }
  }

  async _breathe () {
    if (this.params.length >= 4) {
      let [, ip, port, type, ...name] = this.params
      name = name.join(' ')
      let session = await this.gatherRepository.find(ip, port)
      if (!session) { // If server was not created
        session = await this._addServer(type)
      } else if (session.state === 'offline') {
        await this.gatherRepository.changeState(
          ip, port, 'waiting'
        )
      } else if (session.name !== name) {
        await this.gatherRepository.changeName(ip, port, name)
      } else if (session.type !== type) {
        await this.gatherRepository.changeType(ip, port, type)
      } else {
        await this.gatherRepository.hearthBeat(ip, port)
      }
      return session.state
    }
  }

  async _playerauth () {
    const [, ip, port, pin, steamId] = this.params

    // check if server exists
    const server = await this.gatherRepository.find(ip, port)
    if (server && server.sessionId) {
      const users = await this.usersRepository.get({
        userId: { $in: server.players },
        pin: +pin,
        auth: false
      })
      if (users && users.length === 1) {
        const user = users[0]

        return String(+(await this.usersRepository.authenticate(user.userId, +pin, steamId)))
      }
    }

    return '0'
  }

  async _checkPlayerAuth () {
    const [, steamId] = this.params
    if (!steamId) return
    const user = await this.usersRepository.findBySteamId(steamId)
    return user ? '1' : '0'
  }

  async _serverReady () {
    const [, ip, port, password] = this.params
    if (!this.botClient) return
    const guildClient = this.botClient.guilds.cache.get(config.discordServerId)
    if (!guildClient) return
    const server = await this.gatherRepository.find(ip, port)
    let pinIndex = 1
    let pin = null
    if (server) {
      for (const userId of server.players) {
        const user = await this.usersRepository.find(userId)
        const session = await this.gatherSessionsRepository.find(server.sessionId)
        if (user) { // user exists
          if (!user.auth) { // not auth, need generate pin
            pin = this._generatePin(100 * pinIndex++)
            await this.usersRepository.newPin(userId, pin)
          }
        } else { // create user
          pin = this._generatePin(100 * pinIndex++)
          await this.usersRepository.create(userId, pin)
        }

        // update server password
        await this.gatherRepository.changePassword(ip, port, password)

        let message = `Server: soldat://${ip}:${port}/${password}\n`
        message += 'Time: **' +
        (
          session.players.alpha.indexOf(userId) !== -1 ? 'Alpha' : 'Bravo'
        ) + '**'
        if (pin) message += `\nPin: ${pin}`
        const userClient = guildClient.members.cache.get(userId)
        if (userClient) userClient.send(message)
      }
      await this.gatherRepository.changeState(ip, port, 'running')
    }
  }

  async _round () {
    const [, ip, port, map, alphaScore, bravoScore, ..._playerScores] = this.params
    const server = await this.gatherRepository.find(ip, port)
    if (server && server.sessionId) {
      const players = server.players.slice()
      let session = await this.gatherSessionsRepository.find(server.sessionId)
      session.rounds++
      let team = 'alpha'
      if (session.rounds === 2) team = 'bravo'
      if (session.rounds === 3) team = 'tie'
      else if (session.rounds > 3) team = `round_${session.rounds + 1}`
      if (session) {
        const playerScores = _playerScores.map(score => {
          const [steamId, k, d] = score.split('|')
          return { k, d, steamId }
        })

        await this.gatherSessionsRepository.insertScores(
          server.sessionId,
          team,
          map,
          { alpha: alphaScore, bravo: bravoScore },
          session.rounds,
          playerScores
        )

        // Renew session
        session = await this.gatherSessionsRepository.find(server.sessionId)

        if (
          (session.rounds === config.game.rounds && this._isTiebreak(session)) ||
          session.rounds === config.game.rounds + 1
        ) {
          session.ended = true
          await this.gatherRepository.endGame(ip, port)
        } else if (session.rounds === config.game.rounds) {
          this.gatherRepository.changeState(ip, port, 'tiebreak')
        }

        if (session.ended) { // Send BOT endgame message
          if (this.botClient) {
            if (!this.botClient) return
            const guildClient = this.botClient.guilds.cache.get(config.discordServerId)
            if (!guildClient) return
            const scores = this._compondScores(session)
            guildClient.channels.cache.get(config.channels.gather).send(
              `Jogo do servidor ${server.name}\n` +
              `Alpha Score: ${scores[0]}\n` +
              `Bravo Score: ${scores[1]}\n` +
              (
                players.map(value => `<@${value}>`).join(', ')
              ) + ' <:gg:743341093659344898>'
            )
          }
        }
      }

      return '1'
    }
  }

  async _tiebreakmap () {
    const [, ip, port] = this.params
    const server = await this.gatherRepository.find(ip, port)
    if (server && server.sessionId) {
      const session = await this.gatherSessionsRepository.find(server.sessionId)
      if (session) {
        return session.maps.tie.mapName
      }
    }
  }

  async _createsub () {
    let [, ip, port, num] = this.params
    const server = await this.gatherRepository.find(ip, port)
    if (server && !server.subslots) {
      num = +num || 1
      await this.gatherRepository.createSubQueue(ip, port, num)
      this._gatherChannel().send(`Precisamos de um sub no servidor ${server.name}, digite !sub para entrar na fila.`)
      return '1'
    }
    return '0'
  }

  async _callsub () {
    const [, ip, port] = this.params
    const server = await this.gatherRepository.find(ip, port)
    if (server && server.subs.length > 0) {
      const firstPlayerInQueue = server.subs[0]
      this._guild().members.cache.get(firstPlayerInQueue).send(
        `[SUB] soldat://${server.ip}:${server.port}/${server.password}`
      )
      await this.gatherRepository.callSub(ip, port, firstPlayerInQueue)
      return server.subslots === 1 ? '2' : '1'
    }

    return '0'
  }

  async _suboff () {
    const [, ip, port] = this.params
    await this.gatherRepository.clearSub(ip, port)
    return '1'
  }

  // Help methods
  async _addServer (type) {
    let [, ip, port, ...name] = this.params
    name = name.join(' ')
    const result = await this.gatherRepository.create(ip, port, name, type, 'waiting')
    return result.ops[0]
  }

  _generatePin (plus) {
    return plus + Math.floor(Math.random() * 99)
  }

  _compondScores (session) {
    const alpha =
      (+session.maps.alpha.score.alpha) +
      (+session.maps.bravo.score.alpha) +
      (+session.maps.tie.score.alpha)
    const bravo =
      (+session.maps.alpha.score.bravo) +
      (+session.maps.bravo.score.bravo) +
      (+session.maps.tie.score.bravo)
    return [alpha, bravo]
  }

  _isTiebreak (session) {
    const firstMap = +session.maps.alpha.score.alpha > +session.maps.alpha.score.bravo
    const secondMap = +session.maps.bravo.score.alpha > +session.maps.bravo.score.bravo
    const scores = this._compondScores(session)
    return !(firstMap === secondMap && scores[0] !== scores[1])
  }

  _randomATiebreakMap (type) {
    const n = Math.floor(Math.random() * (config.tiebreakMaps[type].length - 1))
    return config.tiebreakMaps[type][n]
  }

  _guild () {
    return this.botClient ? this.botClient.guilds.cache.get(config.discordServerId) : null
  }

  _gatherChannel () {
    return this._guild().channels.cache.get(config.channels.gather)
  }
}

module.exports = Gather
