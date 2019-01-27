pragma solidity 0.5.0;

contract Splitter {
    
    address public owner; // Alice
    address payable public add1;  // Bob
    address payable public add2;  // Carol
    
    mapping(address => uint) funds;
    
    constructor() public {
        owner = msg.sender;
    }
    
    modifier onlyOwner () {
        require(msg.sender == owner);
        _;
    }
    modifier address0 (address payable add) {
        require(add != address(0));
        _;
    }
    
    // set Bob's address
    function setAddress1 (address payable _add1) public onlyOwner() address0(_add1) {
        require(_add1 != add1);
        add1 = _add1;
    }
    
    function setAddress2 (address payable _add2) public onlyOwner() address0(_add2) {
        require(_add2 != add2);
        add2 = _add2;
    }
    
    function addFunds (address receiver, uint amount) private {
        funds[receiver] += amount;
    }

    function split() public payable onlyOwner() {
        if (msg.value == 0) {
            revert();
        }
        addFunds(add1, msg.value/2);
        addFunds(add2, msg.value/2);
    }
    
    function withdrawFunds() public {
        uint amount = funds[msg.sender];

        require(amount != 0);
        require(address(this).balance >= amount);

        funds[msg.sender] = 0;
        msg.sender.transfer(amount);
    }
    
}
