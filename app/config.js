module.exports = {
  token: process.env.DISCORD_BOT_TOKEN,
  debug: process.env.DEBUG === 'true',
  commandPrefix: '!',
  database: {
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT
  },

  game: {
    get maxplayers () {
      return this.alpha + this.bravo
    },
    alpha: 1,
    bravo: 1,
    rounds: 2
  },

  discordServerId: process.env.DISCORD_SERVER_ID,

  // TODO Refactor, send role map to DB
  roles: {
    // DISCORD INTERFACE ROLES
    clanadmin: process.env.ROLE_CLANADMIN,
    clanlead: process.env.ROLE_CLANLEAD,
    gatheradmin: process.env.ROLE_GATHERADMIN,
    everyone: process.env.ROLE_EVERYONE,

    // WEB INTERFACE ROLES
    server: '1'
  },

  // TODO Refactor, send channels map to DB
  channels: {
    clanadmin: process.env.CHANNEL_CLANADMIN,
    clancategory: process.env.CHANNEL_CLANCATEGORY,
    voiceclancategory: process.env.CHANNEL_VOICECLANCATEGORY,
    gather: process.env.CHANNEL_GATHER,
    botcommands: process.env.CHANNEL_BOTCOMMANDS
  }
}
