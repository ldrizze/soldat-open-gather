export default {
  token: process.env.DISCORD_BOT_TOKEN,
  debug: (process.env.DEBUG === 'true' ?? false),
  commandPrefix: '!'
}
