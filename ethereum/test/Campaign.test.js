const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')
const web3 = new Web3(ganache.provider())
const compiler = require('../compile')

describe('Campaign Contract', function () {
  let compiledFactory
  let compiledCampaign
  let accounts
  let factory
  let campaignAddress
  let campaign

  before(async () => {
    await compiler('Campaign')
    compiledFactory = require('../build/CampaignFactory.json')
    compiledCampaign = require('../build/Campaign.json')
  })

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()

    factory = await new web3.eth
      .Contract(JSON.parse(compiledFactory.interface))
      .deploy({ data: compiledFactory.bytecode })
      .send({ from: accounts[0], gas: '1000000' })

    await factory.methods.createCampaign('100')
      .send({
        from: accounts[0],
        gas: '1000000'
      })

    const addresses = await factory.methods
      .getDeployedCampaigns()
      .call()
    campaignAddress = addresses[0]
    campaign = await new web3.eth.Contract(
      JSON.parse(compiledCampaign.interface),
      campaignAddress
    )
  })

  it('deploys a factory and a campaign', async () => {
    assert.ok(factory.options.address)
    assert.ok(campaign.options.address)
  })

  it('marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call()
    assert.strictEqual(manager, accounts[0])
  })

  it('allows people to contribute money and marks them as approvers', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200',
    })
    const isContributer = await campaign.methods.approvers(accounts[1]).call()
    assert(isContributer)
  })

  it('requires a minimum contribution', async () => {
    await assert.rejects(
      campaign.methods.contribute().send({
        from: accounts[1],
        value: '5'
      })
    )
  })

  it('allows a manager to make a payment request', async () => {
    await campaign.methods.createRequest(
      'Buy batteries',
      '100',
      accounts[1]
    ).send({
      from: accounts[0],
      gas: '1000000'
    })
    const request = await campaign.methods.requests(0)
      .call()
    assert.strictEqual(request.description, 'Buy batteries')
  })

  it('proccess requests', async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether'),
    })

    await campaign.methods.createRequest(
      'Buy batteries',
      web3.utils.toWei('5', 'ether'),
      accounts[1]
    ).send({
      from: accounts[0],
      gas: '1000000',
    })

    await campaign.methods.approveRequest(0)
      .send({
        from: accounts[0],
        gas: '1000000',
      })

    await campaign.methods.finalizeRequest(0)
      .send({
        from: accounts[0],
        gas: '1000000',
      })

    let balance = await web3.eth.getBalance(accounts[1])
    balance = parseFloat(web3.utils.fromWei(balance, 'ether'))
    assert(balance > 104)
  })
})
