import { Context } from '../classes/Context'
import { Command } from '../classes/Command'

class ClanAdministration extends Context {
  constructor (user, userID, channelID, message, event) {

    // Commands for ClanAdministration Context
    this.commands = [
      new Command('!add', 'clanlead'),
      new Command('!addlead', ['clanlead','clanadmin']),
      new Command('!addclan', 'clanadmin'),
      new Command('!removeclan', 'clanadmin')
    ]

    // Variables
    this.user = user
    this.userID = userID
    this.channelID = channelID
    this.message = message
    this.event = event
  }

  /**
   * Validate Context
   * @public
   * @returns boolean
   */
  validate () {

  }

  /**
   * Create new clan if isn't exists
   * @private
   * @return string
   */
  _addClan () {

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

export { ClanAdministration }
