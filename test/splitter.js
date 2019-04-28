const Splitter = artifacts.require("Splitter");
const chai = require('chai');
const BN = web3.utils.BN
chai.use(require('chai-bn')(BN));

contract('Splitter', (accounts) => {
  console.log(accounts);
  const accountSender = accounts[0];
  const accountOne = accounts[1];
  const accountTwo = accounts[2];
  const accountZero = "0x0000000000000000000000000000000000000000";
  const amountBN = new BN('1000000000000000001',10);
  const twoBN = new BN ('2',10);
  const halfBN = amountBN.div(twoBN);
  const remainingBN = amountBN.mod(twoBN);
  console.log("Half is: "+halfBN);
  console.log("Remaining is: "+remainingBN);
  let splitterInstance;
  let initialFundsSenderBN;
  let initialFundsOneBN;
  let initialFundsTwoBN;

  let currentBalanceSender;
  let currentBalanceSenderBN;
  let currentBalanceOne;
  let currentBalanceOneBN;
  let currentBalanceTwo;
  let currentBalanceTwoBN;

  let receipt0;
  let receipt1;
  let receipt2;

  let finalFundsSenderBN;
  let finalFundsOneBN;
  let finalFundsTwoBN;

  before('setup contract at the beginning', async function () {
      splitterInstance = await Splitter.new();
  });

  it('should split the received Ether', async () => {
    // split funds
    await splitterInstance.split(accountOne, accountTwo, {from: accountSender, value: amountBN});

    initialFundsSenderBN = await splitterInstance.funds(accountSender);
    initialFundsOneBN = await splitterInstance.funds(accountOne);
    initialFundsTwoBN = await splitterInstance.funds(accountTwo);
    console.log("Funds sender: "+initialFundsSenderBN);
    console.log("Funds one: "+initialFundsOneBN);
    console.log("Funds two: "+initialFundsTwoBN);

    // check the funds are what are supposed to be
    assert.strictEqual(initialFundsSenderBN.toString(), remainingBN.toString(), "remaining wasn't in the sender's account");
    assert.strictEqual(initialFundsOneBN.toString(), halfBN.toString(), "half wasn't in the first account");
    assert.strictEqual(initialFundsTwoBN.toString(), halfBN.toString(), "half wasn't in the second account");
  }); 

  it('should save current balances and withdraw funds', async () => {
    // save the current account balances to check later 
    currentBalanceSender = await web3.eth.getBalance(accountSender);
    currentBalanceSenderBN = new BN (currentBalanceSender,10);
    currentBalanceOne = await web3.eth.getBalance(accountOne);
    currentBalanceOneBN = new BN (currentBalanceOne,10);
    currentBalanceTwo = await web3.eth.getBalance(accountTwo);
    currentBalanceTwoBN = new BN (currentBalanceTwo,10);

    console.log("Sender account contains: "+currentBalanceSender);
    console.log("Account 1 contains: "+currentBalanceOne);
    console.log("Account 2 contains: "+currentBalanceTwo);

      // withdraw funds
    receipt0 = await splitterInstance.withdrawFunds({from: accountSender});
    receipt1 = await splitterInstance.withdrawFunds({from: accounts[1]});
    receipt2 = await splitterInstance.withdrawFunds({from: accounts[2]});
  });   

  it('should be that remaining balances in the contract are 0', async () => {
    // check the remaining balances are 0
    finalFundsSenderBN = await splitterInstance.funds(accountSender);
    finalFundsOneBN = await splitterInstance.funds(accountOne);
    finalFundsTwoBN = await splitterInstance.funds(accountTwo);
    assert.strictEqual(finalFundsSenderBN.toString(), "0", 'funds one were not correctly withdrawn');
    assert.strictEqual(finalFundsOneBN.toString(), "0", 'funds one were not correctly withdrawn');
    assert.strictEqual(finalFundsTwoBN.toString(), "0", 'funds two were not correctly withdrawn');
  });

  it('should be that balances in the accounts are what are supposed to be', async () => {
    // calculate transaction costs
    const gasUsed0BN = new BN (receipt0.receipt.gasUsed,10);
    const tx0 = await web3.eth.getTransaction(receipt0.tx);
    const gasPrice0BN = new BN (tx0.gasPrice,10);
    const gasUsed1BN = new BN (receipt1.receipt.gasUsed,10);
    const tx1 = await web3.eth.getTransaction(receipt1.tx);
    const gasPrice1BN = new BN (tx1.gasPrice,10);
    const gasUsed2BN = new BN (receipt2.receipt.gasUsed,10);
    const tx2 = await web3.eth.getTransaction(receipt2.tx);
    const gasPrice2BN = new BN (tx2.gasPrice,10);
    //console.log(`GasUsed: ${gasUsed0BN}`);
    //console.log(`GasPrice: ${gasPrice0BN}`);

    // get actual final balances
    const finalBalanceSender = await web3.eth.getBalance(accountSender);
    const finalBalanceSenderBN = new BN (finalBalanceSender,10);
    const finalBalanceOne = await web3.eth.getBalance(accountOne);
    const finalBalanceOneBN = new BN (finalBalanceOne,10);
    const finalBalanceTwo = await web3.eth.getBalance(accountTwo);
    const finalBalanceTwoBN = new BN (finalBalanceTwo,10);

    //console.log("Sender account contains in the end: "+finalBalanceSender);

    // calculate how much should be left on the accounts
    const calcBalanceSenderBN = currentBalanceSenderBN.sub(gasUsed0BN.mul(gasPrice0BN)).add(initialFundsSenderBN);
    const calcBalanceOneBN = currentBalanceOneBN.sub(gasUsed1BN.mul(gasPrice1BN)).add(initialFundsOneBN);
    const calcBalanceTwoBN = currentBalanceTwoBN.sub(gasUsed2BN.mul(gasPrice2BN)).add(initialFundsTwoBN);
    assert.strictEqual(calcBalanceSenderBN.toString(), finalBalanceSenderBN.toString(), 'Sender account balance does not match the expected');
    assert.strictEqual(calcBalanceOneBN.toString(), finalBalanceOneBN.toString(), 'Account 1 balance does not match the expected');
    assert.strictEqual(calcBalanceTwoBN.toString(), finalBalanceTwoBN.toString(), 'Account 2 balance does not match the expected');
  });

  describe ("Other tests",function() {
    beforeEach('setup contract for each test', async function () {
        splitterInstance = await Splitter.new();
    });
    it('should fail when sending 0', async () => {
      let wasError = false;
      try {
        await splitterInstance.split(accountOne, accountTwo, {from: accountSender, value: 0});
      }
      catch (err) {
        wasError = true;
        console.log(err);
      }
      assert.ok(wasError, "splitter did accept a 0 value");
    });

    it('should fail splitting to accounts 0', async () => {
      let wasError = false;
      try {
        await splitterInstance.split(accountOne, accountZero, {from: accountSender, value: amount});
      }
      catch (err) {
        wasError = true;
        console.log(err);
      }
      assert.ok(wasError, "splitter did accept a 0 address");
    });
  })
});
