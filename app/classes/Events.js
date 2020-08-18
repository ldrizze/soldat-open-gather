class Event {
  constructor () {
    this.subs = []
  }

  subscribe (fn) {
    if (typeof fn === 'function') this.subs.push(fn)
  }

  unsubscribe (fn) {
    if (typeof fn === 'function') {
      const _f = this.subs.findIndex(f => f === fn)
      if (_f) this.subs.splice(_f, 1)
    }
  }

  trigger (data) {
    this.subs.forEach(fn => fn(data))
  }
}

exports.OnPresence = new Event()
