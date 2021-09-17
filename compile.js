const fs = require('fs')
const path = require('path')
const solc = require('solc')

module.exports = function (contract) {
  const inboxPath = path.resolve(
    __dirname,
    'contracts',
    `${contract}.sol`
  )
  const source = fs.readFileSync(inboxPath, 'utf-8')
  return solc.compile(source, 1).contracts[`:${contract}`]
}
