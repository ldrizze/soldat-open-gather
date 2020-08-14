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
    alpha: +process.env.ALPHA_PLAYERS,
    bravo: +process.env.BRAVO_PLAYERS,
    rounds: +process.env.ROUNDS
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
  },

  // TODO Refactor, send maps to DB
  tiebreakMaps: [
    'ctf_Aftermath',
    'ctf_Amnesia',
    'ctf_Arabic',
    'ctf_Ash',
    'ctf_Blade',
    'ctf_Campeche',
    'ctf_Cobra',
    'ctf_Death',
    'ctf_Division',
    'ctf_Dropdown',
    'ctf_Guardian',
    'ctf_Hormone',
    'ctf_IceBeam',
    'ctf_Lava',
    'ctf_Nuubia',
    'ctf_Paradigm',
    'ctf_Pod',
    'ctf_Rotten',
    'ctf_Steel',
    'ctf_Voland',
    'ctf_Wretch'
  ]
}
