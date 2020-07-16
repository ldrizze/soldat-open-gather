exports.Silence = class Silence extends Error {
  constructor (userId) {
    super(`Reply ignored for user ${userId}`)
  }
}
