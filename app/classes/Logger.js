import Config from '../config'

export default class Logger {
  constructor (tag) {
    this.tag = tag
  }

  i (d) {
    if (typeof d === 'object') d = JSON.stringify(d)
    console.info(`[INFO][${this.tag}] ${d}`)
  }

  e (d) {
    if (typeof d === 'object') d = JSON.stringify(d)
    console.error(`[ERROR][${this.tag}] ${d}`)
  }

  w (d) {
    if (typeof d === 'object') d = JSON.stringify(d)
    console.error(`[WARNING][${this.tag}] ${d}`)
  }

  d (d) {
    if (!Config.debug) return
    if (typeof d === 'object') d = JSON.stringify(d)
    console.info(`[DEBUG][${this.tag}] ${d}`)
  }
}
