pragma solidity 0.5.0;

contract Splitter {
    
    mapping (address => uint) public funds;
    
    constructor() public {
    }
    
    event LogFundsAdded (
        address indexed _receiver1,
        uint value1,
        address indexed _receiver2,
        uint value2
    );
    
    event LogWithdrawnFunds (
        address _requester,
        uint value
    );
    
    modifier addressNotZero (address  add) {
        require(add != address(0));
        _;
    }
    
    modifier fundsNotZero (address add) {
        require(funds[msg.sender] != 0);
        _;
    }

    function split(address receiver1, address receiver2) public addressNotZero(receiver1) addressNotZero(receiver2) {
        require(msg.value != 0);
        uint half = msg.value / 2;
        funds[receiver1] += half;
        funds[receiver2] += msg.value - half;
        emit LogFundsAdded(receiver1, half, receiver2, msg.value - half);
    }
    
    function withdrawFunds() public fundsNotZero(msg.sender) {
        uint amount = funds[msg.sender];
        funds[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit LogWithdrawnFunds(msg.sender, amount);
    }
}
