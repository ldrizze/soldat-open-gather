import Discord from 'discord.js'
import Config from './config'
import Logger from './classes/Logger'
import Contexts from './contexts/contexts'

const log = new Logger('INIT')
const BOT = new Discord.Client()

BOT.on('ready', () => {
  log.i('Bot ready')
})

BOT.on('message', msg => {
  for (const Context of Contexts) {
    const contextInstance = new Context(msg.author.id, msg.channel.id, msg.content)
    const command = contextInstance.validate()
    if (command) {
      if (command.fn) command.fn.apply(contextInstance, msg)
      break
    }
  }
})

BOT.login(Config.token)
