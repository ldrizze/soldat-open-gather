if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const Discord = require('discord.js')
const Config = require('./config')
const Logger = require('./classes/Logger')
const Contexts = require('./contexts/contexts')
const { ResponseError, Silence } = require('./classes/Errors')
const { MD } = require('./classes/Responses')
const ServerTokens = require('./repositories/ServerTokens')
const express = require('express')

const log = new Logger('BOT')
const logWeb = new Logger('Web')
const BOT = new Discord.Client()
let botReady = false
const serverTokensRepository = new ServerTokens()

/*
=================
BOT INTERFACE
=================
*/

BOT.on('ready', () => {
  log.i('Bot ready')
  botReady = true
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
          if (result instanceof MD) event.author.send(result)
          else if (typeof result === 'string') event.reply(result)
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

app.get('/command', async (req, res) => {
  const commandString = req.query.command
  const token = req.query.token

  const serverToken = await serverTokensRepository.find(token)
  if (!serverToken) {
    res.status(401).send()
    return
  }

  for (const Context of Contexts) {
    const contextInstance = new Context(0, Config.channels.gather, commandString)
    try {
      const command = await contextInstance.validate([serverToken.role])
      if (command) {
        if (botReady) contextInstance.setBotClient(BOT)
        if (command.fn) {
          const result = await command.fn()
          if (result) res.send(result)
        }
      }
    } catch (error) {
      logWeb.e(error.stack ? error.stack : error)
      res.status(500).send()
    }
  }
})

app.listen(process.env.WEBPORT || process.env.PORT || 83462, () => {
  logWeb.i('Web interface ready')
})
