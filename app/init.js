import Discord from 'discord.js'
import Config from './config'

const BOT = new Discord.Client()

BOT.on('ready', (event) => {
  console.log('BOT IS READY!')
})

BOT.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong')
  }
})

BOT.login(Config.token)
