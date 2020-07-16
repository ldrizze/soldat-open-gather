require('dotenv').config()
const mongodb = require('mongodb')
const assert = require('assert')
const MongoClient = mongodb.MongoClient
const user = encodeURIComponent(process.env.MONGO_USERNAME)
const password = encodeURIComponent(process.env.MONGO_PASSWORD)
const port = encodeURIComponent(process.env.MONGO_PORT)
const host = encodeURIComponent(process.env.MONGO_HOST)
const authMechanism = 'DEFAULT'

// Connection URL
const url = `mongodb://${user}:${password}@${host}:${port}/?authMechanism=${authMechanism}`

exports.createClanAdmin = async () => {
  return new Promise(resolve => {
    const client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })

    client.connect(err => {
      assert.equal(null, err)
      const db = client.db('soldatbtbot')

      const collection = db.collection('users')
      collection.insertOne({
        user_id: 99,
        role: ['clanadmin', 'clanlead']
      }, () => {
        console.log('Admin test user created')
        client.close()
        resolve()
      })
    })
  })
}

exports.deleteClanAdmin = () => {
  return new Promise(resolve => {
    const client = new MongoClient(url, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })

    client.connect(err => {
      assert.equal(null, err)
      const db = client.db('soldatbtbot')

      const collection = db.collection('users')
      collection.deleteMany({ user_id: 99 }, (err) => {
        assert.equal(err, null)
        console.log('Admin test user deleted')
        client.close()
        resolve()
      })
    })
  })
}
