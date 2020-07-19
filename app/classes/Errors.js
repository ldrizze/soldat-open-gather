class ResponseError extends Error {}
exports.ResponseError = ResponseError

exports.Silence = class Silence extends Error {
  constructor (userId) {
    super(`Reply ignored for user ${userId}`)
  }
}

exports.AlreadyMember = class AlreadyMember extends ResponseError {
  constructor () {
    super('Esse membro já faz parte do seu clã.')
  }
}

exports.ClanNotFound = class ClanNotFound extends ResponseError {
  constructor () {
    super('Não foi possível encontrar seu clã nos registros.')
  }
}

exports.NotClanMember = class NotClanMember extends ResponseError {
  constructor () {
    super('Esse usuário não é membro do seu clã.')
  }
}

exports.InvalidChannel = class InvalidChannel extends ResponseError {
  constructor () {
    super('Canal inválido para este comando!')
  }
}

exports.NotClanLead = class NotClanLead extends ResponseError {
  constructor (clanName) {
    super(`Você precisa ser lider do clã ${clanName} para utilizar esse comando.`)
  }
}

exports.CantRemoveLead = class CantRemoveLead extends ResponseError {
  constructor () {
    super('Você não pode remover outro líder, contate um administrador de clãs para isso.')
  }
}
