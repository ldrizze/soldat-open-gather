if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const Discord = require('discord.js')
const Config = require('./config')
const Logger = require('./classes/Logger')
const Contexts = require('./contexts/contexts')
const { ResponseError, Silence } = require('./classes/Errors')
const express = require('express')

const log = new Logger('BOT')
const logWeb = new Logger('Web')
const BOT = new Discord.Client()

/*
=================
BOT INTERFACE
=================
*/

BOT.on('ready', () => {
  log.i('Bot ready')
})

BOT.on('message', async (event) => {
  // Validate if is a command
  if (event.content[0] !== Config.commandPrefix) {
    if (event.channel.id === Config.channels.botcommands && event.author.id !== BOT.user.id) {
      await event.delete().catch(e => { log.e(e) })
    }
    return
  }

  // Grab roles
  const roles = []
  event.member.roles.cache.forEach(role => roles.push(role.id))

  for (const Context of Contexts) {
    const contextInstance = new Context(event.author.id, event.channel.id, event.content)
    try {
      const command = await contextInstance.validate(roles)
      if (command) {
        if (command.fn) {
          const result = await command.fn(event)
          if (typeof result === 'string') event.reply(result)
        } else {
          log.d(`Command ${command.command} has no function in context ${Context.constructor.name}`)
        }
        break
      } else {
        log.d(`Command ${event.content} not found in context ${Context.constructor.name}`)
      }
    } catch (error) {
      log.e(error.message)
      log.d(error.stack)
      if (error instanceof Silence) return
      if (error instanceof ResponseError) {
        event.reply(error.message)
        break
      }
    }
  }
})

BOT.login(Config.token)

/*
=================
WEB INTERFACE
=================
*/

// TODO Web interface
const app = express()

app.get('/command', (req, res) => {
  const commandString = req.query.command
  const token = req.query.token

  for (const Context of Contexts) {
    const contextInstance = new Context(event.author.id, event.channel.id, event.content)
    try {

    } catch (error) {

    }
  }
})

app.listen(4040, () => {
  logWeb.i('Web interface ready')
})
