console.log("starting");
const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const splitterJson = require("../../build/contracts/Splitter.json");



// Supports Metamask, and other wallets that provide / inject 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
	console.log("Mist/wallet/Metamask provider");
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
	console.log("preferred callback");
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}



const Splitter = truffleContract(splitterJson);
let accountsGlobal;
Splitter.setProvider(web3.currentProvider);

window.addEventListener('load', function() {

    return web3.eth.getAccounts()
        .then(accounts => {
            accountsGlobal = accounts;
            if (accounts.length == 0) {
                $("#balance").html("N/A");
                throw new Error("No account with which to transact");
            }
	    let accountsHTML="Select an account: ";
            for (i = 0; i < accounts.length; i++) { 
                accountsHTML+='<button id="account'+i+'" >Account'+i+'</button>';
            }
            $("#accounts").html(accountsHTML);
	    for (j = 0; j < accounts.length; j++) { 
		(function(j) {
                    $("#account"+j).click(function() {
                        switchAccount(j);
                    });
                })(j);

            }
            window.account = accounts[0];
            console.log("Accounts: ", accounts);
            console.log("Account:", window.account);
            console.log("Balance: ", web3.eth.getBalance(accounts[0]));
            return web3.eth.net.getId();
        })
        .then(network => {
            console.log("Network:", network.toString(10));
            console.log(window.account);

            return Splitter.deployed();
        })
        .then(deployed => deployed.funds.call(window.account))
        // Notice how the conversion to a string is done only when displaying.
        .then(balance => $("#balance").html(balance.toString(10)))
        //.then(balance => console.log(balance.toString(10)))
        // We split when the system looks in order.
        .then(() => $("#split").click(splitCoins))
        // We withdraw when the system looks in order.
        .then(() => $("#withdraw").click(withdraw))
        // Never let an error go unlogged.
        .catch(console.error);
});
const splitCoins = function() {
    console.log("clicked split");
    const gas = 300000; let deployed;
    return Splitter.deployed()
        .then(_deployed => {
            deployed = _deployed;
	    console.log("attempt to execute the call");
            return _deployed.split.call(
                $("input[name='recipient1']").val(),
                $("input[name='recipient2']").val(),
                { from: window.account, value: $("input[name='amount']").val(), gas: gas });
        })
        .then(success => {
            if (!success) {
               throw new Error("The transaction will fail anyway, not sending");
            }
            return deployed.split(
                $("input[name='recipient1']").val(),
                $("input[name='recipient2']").val(),
                { from: window.account, value: $("input[name='amount']").val(), gas: gas })
                .on(
                    "transactionHash",
                    txHash => $("#status").html("Transaction on the way " + txHash)
                );
        })
        .then(txObj => {
            const receipt = txObj.receipt;
            console.log("got receipt", receipt);
            if (!receipt.status) {
                console.error("Wrong status");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution, status not 1");
            } else if (receipt.logs.length == 0) {
                console.error("Empty logs");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution, missing expected event");
            } else {
                console.log(receipt.logs[0]);
                $("#status").html("Transfer executed");
            }
            // Make sure we update the UI.
            return deployed.funds.call(window.account);
        })
        .then(balance => {
            console.log(balance);
            $("#balance").html(balance.toString(10))
        })
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
}
const withdraw = function() {
    console.log("clicked withdraw");
    const gas = 300000; let deployed;
    return Splitter.deployed()
        .then(_deployed => {
            deployed = _deployed;
	    console.log("attempt to execute the call");
            return _deployed.withdrawFunds.call({ from: window.account, gas: gas });
        })
        .then(success => {
            if (!success) {
               throw new Error("The transaction will fail anyway, not sending");
            }
            return deployed.withdrawFunds({ from: window.account, gas: gas })
                .on(
                    "transactionHash",
                    txHash => $("#status").html("Transaction on the way " + txHash)
                );
        })
        .then(txObj => {
            const receipt = txObj.receipt;
            console.log("got receipt", receipt);
            if (!receipt.status) {
                console.error("Wrong status");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution, status not 1");
            } else if (receipt.logs.length == 0) {
                console.error("Empty logs");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution, missing expected event");
            } else {
                console.log(receipt.logs[0]);
                $("#status").html("Transfer executed");
            }
            // Make sure we update the UI.
            return deployed.funds.call(window.account);
        })
        .then(balance => {
            console.log(balance);
            $("#balance").html(balance.toString(10))
        })
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
}

const switchAccount = function(n) {
    console.log("clicked switchAccount to "+n);
    const gas = 300000; let deployed;
    window.account = accountsGlobal[n];
    console.log("my account is now: "+window.account);
    return Splitter.deployed()
    .then(deployed => deployed.funds.call(window.account))
    .then(balance => {
        console.log(balance.toString(10));
        $("#balance").html(balance.toString(10))
    })
    .catch(e => {
        $("#status").html(e.toString());
        console.error(e);
    });
}

require("file-loader?name=../index.html!../index.html");
