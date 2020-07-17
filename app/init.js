const Discord = require('discord.js')
const Config = require('./config')
const Logger = require('./classes/Logger')
const Contexts = require('./contexts/contexts')
const { Silence } = require('./classes/Errors')

const log = new Logger('INIT')
const BOT = new Discord.Client()

BOT.on('ready', () => {
  log.i('Bot ready')
})

BOT.on('message', async (event) => {
  for (const Context of Contexts) {
    const contextInstance = new Context(event.author.id, event.channel.id, event.content)
    try {
      const command = await contextInstance.validate(event.member.roles, event)
      if (command) {
        if (command.fn) {
          event.reply(command.fn.apply(contextInstance, event))
        } else {
          log.w(`Command ${command.command} has no function`)
        }
        break
      }
    } catch (error) {
      if (error instanceof Silence) return
      event.reply(error.message)
    }
  }
})

BOT.login(Config.token)
