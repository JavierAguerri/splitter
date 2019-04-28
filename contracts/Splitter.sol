pragma solidity 0.5.0;

library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
 
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }
 
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }
 
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Splitter {
    using SafeMath for uint256; 
    
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
    
//    modifier fundsNotZero (address add) {
//        require(funds[add] > 0, "Address has no funds available to withdraw");
//        _;
//    }

    function split(address receiver1, address receiver2) payable public {
    	require(receiver1 != address(0), "Receiving address cannot be zero");
    	require(receiver2 != address(0), "Receiving address cannot be zero");
        require(msg.value>0, "Amount splitted cannot be zero");
        uint half = msg.value / 2;
        funds[receiver1] = funds[receiver1].add(half);
    	emit LogFundsAdded(receiver1, half);
        funds[receiver2] = funds[receiver2].add(half);
    	emit LogFundsAdded(receiver2, half);
    	if (msg.value %2 != 0) {
    		funds[msg.sender] = funds[msg.sender].add(msg.value % 2);
    		emit LogFundsAdded(msg.sender, msg.value % 2);
    	}
    }
    
    function withdrawFunds() public {
        uint amount = funds[msg.sender];
        require(amount > 0, "Address has no funds available to withdraw");
        funds[msg.sender] = 0;
	    emit LogWithdrawnFunds(msg.sender, amount);
        msg.sender.transfer(amount);
    }
}
