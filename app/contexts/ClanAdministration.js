import { Context } from '../classes/Context'
import { Command } from '../classes/Command'

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
    // TODO Create a clan in DB
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
