/*eslint-disable*/

require('dotenv').config()
const { expect } = require('chai')
const createTestUsers = require('../seeds/createTestUsers')
const ClanAdministration = require('../dist/contexts/ClanAdministration')

describe('ClanAdministration context unit tests', () => {
  before(async () => {
    return await createTestUsers.createClanAdmin()
  })

  it('!addclan', async () => {
    const addClan = new ClanAdministration(99, 1, '!addclan XYZ')
    const command = addClan.validate()
    expect(command).be.an('object')
    const result = await command.fn()
    expect(result).be.an('string')
  })

  it('!addlead', async () => {
    const addLead = new ClanAdministration(99, 1, '!addlead XYZ @Fake', 100)
    const command = addLead.validate()
    expect(command).be.an('object')
    const result = await command.fn()
    expect(result).be.an('string')
  })

  it('!removeclan', async () => {
    const removeClan = new ClanAdministration(99, 1, '!removeclan XYZ')
    const command = removeClan.validate()
    expect(command).be.an('object')
    const result = await command.fn()
    expect(result).be.an('string')
  })

  after(async () => {
    return await createTestUsers.deleteClanAdmin()
  })
})
