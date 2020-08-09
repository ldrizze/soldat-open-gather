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
    alpha: 3,
    bravo: 3
  },

  // TODO Refactor, send role map to DB
  roles: {
    // DISCORD INTERFACE ROLES
    clanadmin: '715556952133992528',
    clanlead: '733597911811751966',
    gatheradmin: '741907054817574923',
    everyone: '238690452675493888',

    // WEB INTERFACE ROLES
    server: '1'
  },

  // TODO Refactor, send channels map to DB
  channels: {
    clanadmin: '733647075484631071',
    clancategory: '715295359827443903',
    voiceclancategory: '715200941963345920',
    gather: '741907864624300076',
    botcommands: '733670794009378927'
  }
}
