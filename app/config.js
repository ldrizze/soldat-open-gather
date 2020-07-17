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

  // TODO Refactor, send role map to DB
  roles: {
    clanadmin: 715556952133992528,
    clanlead: 733597911811751966
  },

  // TODO Refactor, send channels map to DB
  channels: {
    clanadmin: 715212281377587250
  }
}
