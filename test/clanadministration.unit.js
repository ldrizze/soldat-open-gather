/*eslint-disable*/
/*
require('dotenv').config()
const { expect } = require('chai')
const createTestUsers = require('../seeds/createTestUsers')
const ClanAdministration = require('../app/contexts/ClanAdministration')

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

  it('!add', async () => {
    const addMember = new ClanAdministration(100, 1, '!add @FakeTwo', 101)
    const command = addMember.validate()
    expect(command).be.an('object')
    const result = await command.fn()
    expect(result).be.an('string')
  })

  it('!remove', async () => {
    const removeMember = new ClanAdministration(100, 1, '!remove @FakeTwo', 101)
    const command = removeMember.validate()
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
*/
// Disabled until create a better interface
