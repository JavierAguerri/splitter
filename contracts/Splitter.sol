pragma solidity 0.5.0;

contract Splitter {
    
    mapping (address => uint) public funds;
    
    constructor() public {
    }
    
    event LogFundsAdded (
        address indexed receiver,
        uint indexed value
    );
    
    event LogWithdrawnFunds (
        address indexed requester,
        uint indexed value
    );
    
    modifier fundsNotZero (address add) {
        require(funds[add] > 0, "Address has no funds available to withdraw");
        _;
    }

    function split(address receiver1, address receiver2) payable public {
    	require(receiver1 != address(0), "Receiving address cannot be zero");
    	require(receiver2 != address(0), "Receiving address cannot be zero");
        require(msg.value>0, "Amount splitted cannot be zero");
            uint half = msg.value / 2;
            funds[receiver1] += half;
    	emit LogFundsAdded(receiver1, half);
            funds[receiver2] += half;
    	emit LogFundsAdded(receiver2, half);
    	if (msg.value %2 != 0) {
    		funds[msg.sender] += msg.value % 2;
    		emit LogFundsAdded(msg.sender, msg.value % 2);
    	}
    }
    
    function withdrawFunds() public fundsNotZero(msg.sender) {
        uint amount = funds[msg.sender];
        funds[msg.sender] = 0;
	    emit LogWithdrawnFunds(msg.sender, amount);
        msg.sender.transfer(amount);
    }
}
