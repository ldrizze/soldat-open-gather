const mongodb = require('mongodb')
const Logger = require('./Logger')
const Config = require('../config')
const assert = require('assert')

const MongoClient = mongodb.MongoClient
const user = encodeURIComponent(Config.database.username)
const password = encodeURIComponent(Config.database.password)
const port = encodeURIComponent(Config.database.port)
const host = encodeURIComponent(Config.database.host)
const authMechanism = 'DEFAULT'
const log = new Logger('MONGO')

// Connection URL
const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}`

// Create a new MongoClient
const client = new MongoClient(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})

let db = {}
client.connect(err => {
  assert.equal(null, err)
  log.i('Connected, making operation')
  db = client.db('soldatbtbot')
})

function operation (fn) {
  if (typeof fn === 'function') fn(db)
  else log.w('Operation callback is not a function')
}

exports.operation = operation
