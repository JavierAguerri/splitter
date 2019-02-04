pragma solidity 0.5.0;

contract Splitter {
    
    address public owner; // Alice
    
    mapping (address => uint) public funds;
    
    constructor() public {
        owner = msg.sender;
    }
    
    event addedFunds (
        address payable indexed _receiver,
        uint value
    );
    
    event withdrawnFunds (
        address payable _requester,
        uint value
    );
    
    modifier address0 (address payable add) {
        require(add != address(0));
        _;
    }

    function split(address payable receiver1, address payable receiver2) public payable address0(receiver1) address0(receiver2) {
        require(msg.value != 0);
        funds[receiver1] += msg.value/2 + msg.value%2;
        emit addedFunds(receiver1, funds[receiver1]);
        funds[receiver2] += msg.value/2;
        emit addedFunds(receiver2, funds[receiver2]);
    }
    
    function withdrawFunds() public {
        uint amount = funds[msg.sender];
        require(amount != 0);
        funds[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit withdrawnFunds(msg.sender, amount);
    }
}
