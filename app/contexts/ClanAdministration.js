import { Context } from '../classes/Context'
import { Command } from '../classes/Command'
import { operation, db } from '../classes/Mongo'
import slugify from 'slugify'

export default class ClanAdministration extends Context {
  constructor (user, channel, message) {
    super(user, channel, message)

    // Commands for ClanAdministration Context
    this.commands = [
      new Command('add', 'clanlead', this._addMember),
      new Command('addlead', ['clanlead', 'clanadmin'], this._addLead),
      new Command('addclan', 'clanadmin', this._addClan),
      new Command('removeclan', 'clanadmin', this._removeClan),
      new Command('remove', ['clanlead', 'clanadmin'], this._removeMember)
    ]
  }

  /**
   * Validate Context
   * @public
   * @returns Command
   */
  validate () {
    const command = this._validateCommands()
    if (command) {
      // TODO Validate if is correct channel
    }
  }

  /**
   * Create new clan if isn't exists
   * @private
   * @return string
   */
  _addClan () {
    operation(() => {
      const message = this.message.split(' ')

      if (message.length === 2) {
        const collection = db.collection('clans')
        collection.insertOne({
          slug: slugify(message[1]),
          name: message[1],
          added_by: this.user
        })
      }
    })
  }

  /**
   * Add a new lead to a clan
   * @private
   * @returns string
   */
  _addLead () {

  }

  /**
   * Add new member to a clan
   * @private
   * @returns string
   */
  _addMember () {

  }

  /**
   * Remove a member from a clan
   * @private
   * @returns string
   */
  _removeMember () {

  }

  /**
   * Remove a clan and delete all members from it
   * @private
   * @returns string
   */
  _removeClan () {

  }
}
