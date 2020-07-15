import mongodb from 'mongodb'
import Logger from './Logger'
import Config from '../config'
import assert from 'assert'

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
const client = new MongoClient(url)
const db = client.db('soldatbtbot')

function operation (fn) {
  client.connect(err => {
    assert.equal(null, err)
    log.i('Connected, making operation')

    if (typeof fn === 'function') fn()
    else log.w('Operation callback is not a function')
  })
}

export { client, operation, db }
