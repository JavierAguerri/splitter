pragma solidity 0.5.2;


contract Splitter {
    
    mapping (address => uint) public funds;
    
    constructor() public {
    }
    
    event LogFundsAdded (
        address indexed sender,
        uint value,
        address indexed requester1,
        address indexed requester2
    );
    
    event LogWithdrawnFunds (
        address indexed requester,
        uint indexed value
    );
    
//    modifier fundsNotZero (address add) {
//        require(funds[add] > 0, "Address has no funds available to withdraw");
//        _;
//    }

    function split(address receiver1, address receiver2) payable public {
    	require(receiver1 != address(0), "Receiving address cannot be zero");
    	require(receiver2 != address(0), "Receiving address cannot be zero");
        require(msg.value>0, "Amount splitted cannot be zero");
        uint half = msg.value / 2;
        funds[receiver1] = funds[receiver1]+half;
    	//emit LogFundsAdded(receiver1, half);
        funds[receiver2] = funds[receiver2]+half;
    	//emit LogFundsAdded(receiver2, half);
        //uint mod = msg.value %2;
    	funds[msg.sender] = funds[msg.sender]+msg.value %2;
    	emit LogFundsAdded(msg.sender, msg.value, receiver1, receiver2);
    }
    
    function withdrawFunds() public {
        uint amount = funds[msg.sender];
        require(amount > 0, "Address has no funds available to withdraw");
        funds[msg.sender] = 0;
	    emit LogWithdrawnFunds(msg.sender, amount);
        msg.sender.transfer(amount);
    }
}
