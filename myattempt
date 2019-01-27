pragma solidity 0.5.0;

contract Splitter {
    
    address owner; // Alice
    address payable add1;  // Bob
    address payable add2;  // Carol
    
    constructor() public {
        owner = msg.sender;
    }
    
    // set Bob's address
    function setAddress1 (address payable _add1) public{
        if (msg.sender != owner) return;
        add1 = _add1;
    }
    
    function setAddress2 (address payable _add2) public{
        if (msg.sender != owner) return;
        add2 = _add2;
    }
    
    function getAddress1 () public view returns (address payable) {
        return add1;
    }
    
    function getAddress2 () public view returns (address payable) {
        return add2;
    }
        
    function getBalance () public view returns (uint) {
         return address(this).balance;
    }
    
    function getBalance1 () public view returns (uint) {
        return add1.balance;
    }
    
    function getBalance2 () public view returns (uint) {
        return add2.balance;
    }
    
    function getBalanceOwner() public view returns (uint) {
        return owner.balance;
    }

    function split() public payable {
        if (msg.sender != owner) {
            revert();
        }
        uint amount=msg.value;
        add1.transfer(amount/2);
        add2.transfer(amount/2);
    }
    
}
