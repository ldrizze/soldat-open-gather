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
log.i(`Connectingo to ${host}:${port}`)

// Create a new MongoClient
const client = new MongoClient(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})

const connected = new Promise(resolve => {
  client.connect(err => {
    assert.equal(null, err)
    log.i('Connected')
    db = client.db('soldatbtbot')
    resolve()
  })
})

let db = {}

function operation (fn) {
  if (typeof fn === 'function') fn(db)
  else log.w('Operation callback is not a function')
}

function getDB () {
  return db
}

exports.operation = operation
exports.getDB = getDB
exports.connected = connected
