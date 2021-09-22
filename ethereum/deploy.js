const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const config = require('./config')
const compiler = require('./compile')
const contract = process.argv[2]
const contractName = process.argv[3]
  ? process.argv[3]
  : contract

const deploy = async () => {
  const output = await compiler(contract)
  const { interface, bytecode } = output[`:${contractName}`]

  const provider = new HDWalletProvider(
    config.mnemonic,
    config.infuraAPI
  )
  const web3 = new Web3(provider)

  const accounts = await web3.eth.getAccounts()
  console.log('Attempting to deploy from account', accounts[0])
  const contractArguments = {
    Inbox: ['Initial message'],
    Lottery: [],
    Campaign: [],
  }

  const result = await new web3.eth
    .Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,
      arguments: contractArguments[contract]
    })
    .send({
      from: accounts[0],
      gas: '1000000',
      gasPrice: '5000000000',
    })

  console.log('--------')
  console.log('Interface:')
  console.log(interface)
  console.log('--------')
  console.log('Contract deployed to:')
  console.log(result.options.address)
}

deploy()
