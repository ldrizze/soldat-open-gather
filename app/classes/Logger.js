const Config = require('../config')

module.exports = class Logger {
  constructor (tag) {
    this.tag = tag
  }

  i () {
    for (let d of arguments) {
      if (typeof d === 'object') d = JSON.stringify(d)
      console.info(`[INFO][${this.tag}] ${d}`)
    }
  }

  e () {
    for (let d of arguments) {
      if (typeof d === 'object') d = JSON.stringify(d)
      console.error(`[ERROR][${this.tag}] ${d}`)
    }
  }

  w () {
    for (let d of arguments) {
      if (typeof d === 'object') d = JSON.stringify(d)
      console.error(`[WARNING][${this.tag}] ${d}`)
    }
  }

  d () {
    if (!Config.debug) return
    for (let d of arguments) {
      if (typeof d === 'object') d = JSON.stringify(d)
      console.info(`[DEBUG][${this.tag}] ${d}`)
    }
  }
}
