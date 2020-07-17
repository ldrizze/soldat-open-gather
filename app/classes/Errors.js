exports.Silence = class Silence extends Error {
  constructor (userId) {
    super(`Reply ignored for user ${userId}`)
  }
}

exports.AlreadyMember = class AlreadyMember extends Error {
  constructor () {
    super('Esse membro já faz parte do seu clã.')
  }
}

exports.ClanNotFound = class ClanNotFound extends Error {
  constructor () {
    super('Não foi possível encontrar seu clã nos registros.')
  }
}

exports.NotClanMember = class NotClanMember extends Error {
  constructor () {
    super('Esse usuário não é membro do seu clã.')
  }
}
