import Discord from 'discord.js'
import Config from './config'
import Logger from './classes/Logger'
import Contexts from './contexts/contexts'

const log = new Logger('INIT')
const BOT = new Discord.Client()

BOT.on('ready', () => {
  log.i('Bot ready')
})

BOT.on('message', async (event) => {
  for (const Context of Contexts) {
    const contextInstance = new Context(event.author.id, event.channel.id, event.content)
    const command = contextInstance.validate(event.member.roles, event)
    if (command) {
      if (command.fn) {
        try {
          event.reply(command.fn.apply(contextInstance, event))
        } catch (error) {
          event.reply(error.message)
        }
      }
      break
    }
  }
})

BOT.login(Config.token)
