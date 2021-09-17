const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const compiler = require('../compile')
const web3 = new Web3(ganache.provider())

describe('Lottery', () => {
  let accounts
  let lottery

  beforeEach(async () => {
    const { interface, bytecode } = compiler('Lottery')

    // Get a list of all accounts
    accounts = await web3.eth.getAccounts()

    // Use one of those accounts to deploy
    // the contract
    lottery = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({
        data: bytecode,
        arguments: []
      })
      .send({
        from: accounts[0],
        gas: '1000000'
      })
  })

  it('deploys a contract', async () => {
    assert.ok(lottery.options.address)
  })

  // it('has a default message', async () => {
  //   const message = await lottery.methods.message().call()
  //   assert.strictEqual(message, 'Initial message')
  // })

  // it('can change the message', async () => {
  //   const tx = await lottery.methods.setMessage('New message')
  //     .send({
  //       from: accounts[0]
  //     })
  //   const message = await lottery.methods.message().call()
  //   assert.ok(tx.status)
  //   assert.strictEqual(message, 'New message')
  // })
})
