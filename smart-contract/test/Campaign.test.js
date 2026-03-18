const assert = require("assert");
const ganache = require("ganache");
const Web3 = require("web3");

const provider = ganache.provider({ logging: { quiet: true } });
const web3 = new Web3(provider);

const compiledFactory = require("../build/CampaignFactory.json");
const compiledCampaign = require("../build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(compiledFactory.abi)
    .deploy({
      data: `0x${compiledFactory.bytecode}`,
    })
    .send({ from: accounts[0], gas: "5000000" });

  await factory.methods
    .createCampaign(
      web3.utils.toWei("0.1", "ether"),
      "Community Garden",
      "Build a neighborhood garden",
      "https://example.com/garden.png",
      web3.utils.toWei("10", "ether")
    )
    .send({ from: accounts[0], gas: "5000000" });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
  campaign = new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

after(async () => {
  await provider.disconnect();
});

describe("Campaigns", () => {
  it("deploys a factory and campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks the caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.strictEqual(manager, accounts[0]);
  });

  it("allows people to contribute and become approvers once", async () => {
    await campaign.methods.contibute().send({
      from: accounts[1],
      value: web3.utils.toWei("1", "ether"),
    });

    await campaign.methods.contibute().send({
      from: accounts[1],
      value: web3.utils.toWei("1", "ether"),
    });

    const isApprover = await campaign.methods.approvers(accounts[1]).call();
    const approversCount = await campaign.methods.approversCount().call();

    assert.strictEqual(isApprover, true);
    assert.strictEqual(approversCount, "1");
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contibute().send({
        from: accounts[2],
        value: web3.utils.toWei("0.01", "ether"),
      });
      assert.fail("Expected contribute to fail.");
    } catch (error) {
      assert.match(error.message, /minimum amount/i);
    }
  });

  it("processes a request end to end", async () => {
    await campaign.methods.contibute().send({
      from: accounts[1],
      value: web3.utils.toWei("5", "ether"),
    });

    await campaign.methods.createRequest(
      "Buy materials",
      web3.utils.toWei("1", "ether"),
      accounts[2]
    ).send({ from: accounts[0], gas: "5000000" });

    await campaign.methods.approveRequest(0).send({ from: accounts[1], gas: "5000000" });
    await campaign.methods.finalizeRequest(0).send({ from: accounts[0], gas: "5000000" });

    const request = await campaign.methods.requests(0).call();
    assert.strictEqual(request.complete, true);
  });
});
