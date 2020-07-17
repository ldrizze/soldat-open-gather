module.exports = {
  token: process.env.DISCORD_BOT_TOKEN,
  debug: process.env.DEBUG === 'true',
  commandPrefix: '!',
  database: {
    username: process.env.MONGO_USERNAME,
    password: process.env.MONGO_PASSWORD,
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT
  }
}
