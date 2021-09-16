const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())
const { interface, bytecode } = require('../compile')

describe('Inbox', () => {
  let accounts
  let inbox

  beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts()

    // Use one of those accounts to deploy
    // the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data: bytecode, arguments: ['Initial message'] })
      .send({ from: accounts[0], gas: '1000000' })
  })

  it('deploys a contract', async () => {
    assert.ok(inbox.options.address)
  })

  it('has a default message', async () => {
    const message = await inbox.methods.message().call()
    assert.strictEqual(message, 'Initial message')
  })

  it('can change the message', async () => {
    const tx = await inbox.methods.setMessage('New message')
      .send({
        from: accounts[0]
      })
    const message = await inbox.methods.message().call()
    assert.ok(tx.status)
    assert.strictEqual(message, 'New message')
  })
})
