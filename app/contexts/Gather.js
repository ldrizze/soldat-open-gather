const Context = require('../classes/Context')
const Command = require('../classes/Command')
const Logger = require('../classes/Logger')
const GatherSessions = require('../repositories/GatherSessions')
const config = require('../config')

module.exports = class Gather extends Context {
  constructor (user, channel, message) {
    super(user, channel, message)
    this.commands = [
      new Command('breathe', ['server'], this._breathe.bind(this)),
      new Command('addctf', ['everyone'], this._addCTF.bind(this)),
      new Command('remove', ['everyone'], this._remove.bind(this))
    ]
    this.log = new Logger('Gather')
    this.gatherRepository = new GatherSessions()
    this.params = message.split(' ')
  }

  async validate (roles) {
    const command = this._validateCommands()

    if (command) {
      const normalizedRoles = this._normalizeRoles(roles)
      if (this._validateCommandRole(command, normalizedRoles)) {
        if (this.channel === config.channels.gather) return command
      }
    }
  }

  async _addServer () {
    const [, ip, port, name] = this.params
    await this.gatherRepository.create(ip, port, name)
    return `Servidor ${this.params[3]} ${ip}:${port} adicionado com sucesso`
  }

  async _removeServer () {
    if (this.params.length === 3) {
      const [, ip, port] = this.params
      await this.gatherRepository.delete(ip, port)
      return `Servidor ${ip}:${port} removido com sucesso`
    }
  }

  async _breathe () {
    if (this.params.length === 4) {
      const [, ip, port] = this.params
      const session = await this.gatherRepository.find(ip, port)
      if (session && session.state === 'unknown') {
        await this.gatherRepository.changeState(
          ip, port, 'waiting'
        )
        return `Servidor ${ip}:${port} unknown -> waiting`
      } else if (!session) { // If server not created
        return this._addServer()
      }
    }
  }

  async _addCTF () {
    const availableSessions = await this.gatherRepository.available()
    if (availableSessions.length > 0) {
      const session = availableSessions[0]
      await this.gatherRepository.addPlayer(session.ip, session.port, this.user)
      return `Adicionado a fila do server ${session.name}`
    }
  }

  _remove (event) {

  }
}
