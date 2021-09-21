const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const compiler = require('../compile')
const web3 = new Web3(ganache.provider())

describe('Lottery Contract', () => {
  let accounts
  let lottery

  beforeEach(async () => {
    const contracts = await compiler('Lottery')
    const { interface, bytecode } = contracts[':Lottery']

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

  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.002', 'ether')
    })
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })
    assert.strictEqual(accounts[0], players[0])
    assert.strictEqual(players.length, 1)
  })

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.002', 'ether')
    })
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.002', 'ether')
    })
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.002', 'ether')
    })
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    })
    assert.strictEqual(accounts[0], players[0])
    assert.strictEqual(accounts[1], players[1])
    assert.strictEqual(accounts[2], players[2])
    assert.strictEqual(players.length, 3)
  })

  it('requires a minimum amount of ether to enter', async () => {
    await assert.rejects(async () => {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.001', 'ether')
      })
    })
  })

  it('only manager can call pickWinner', async () => {
    await assert.rejects(async () => {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei('0.002', 'ether')
      })
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      })
    })
  })

  it('sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    })
    const initialBalance = await web3.eth.getBalance(accounts[0])
    await lottery.methods.pickWinner().send({ from: accounts[0] })
    const finalBalance = await web3.eth.getBalance(accounts[0])
    const difference = finalBalance - initialBalance
    assert(difference > web3.utils.toWei('1.8', 'ether'))
  })
})
