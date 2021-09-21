const fs = require('fs')
const path = require('path')
const solc = require('solc')
const fileUtils = require('./helpers/file_utils')

module.exports = async function (contract) {
  const buildPath = path.resolve(
    __dirname,
    'build'
  )
  await fileUtils.unlinkDir(buildPath)
  const inboxPath = path.resolve(
    __dirname,
    'contracts',
    `${contract}.sol`
  )
  const source = await fs.promises.readFile(inboxPath, 'utf-8')
  const output = solc.compile(source, 1)
  await fileUtils.ensureDirectory(buildPath)
  for (const contractCompiled in output.contracts) {
    await fs.promises.writeFile(
      path.resolve(
        buildPath,
        contractCompiled.replace(':', '') + '.json'
      ),
      JSON.stringify(output.contracts[contractCompiled])
    )
  }
  return output.contracts
}
