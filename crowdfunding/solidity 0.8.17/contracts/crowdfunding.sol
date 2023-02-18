// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Crowdfunding {
    // The address of the project creator
    address public owner;
    
    // The project deadline (in seconds since the Unix epoch)
    uint256 public deadline;
    
    // The minimum goal for the project (in wei)
    uint256 public goal;
    
    // The mapping of funding that has been raised (in wei)
    mapping(address => uint256) public pledgeOf;

    // Constructor function to initialize the contract
    constructor(uint256 _numberOfDays, uint256 _goal) {
        require(_numberOfDays > 0, "numberOfDays must be greater than zero");
        require(_goal > 0, "goal must be greater than zero");

        owner = msg.sender;
        deadline = block.timestamp + (_numberOfDays * 1 days);
        goal = _goal;
    }

    // Function to allow backers to contribute to the project
    function pledge() public payable {
        require(block.timestamp < deadline);

        pledgeOf[msg.sender] += msg.value;
    }

    // Function to allow the project creator to retrieve the funds
    function claimFunds() public {
        require(address(this).balance >= goal);
        require(block.timestamp >= deadline);
        require(msg.sender == owner);

        payable(msg.sender).transfer(address(this).balance);
    }

    // Function to allow backers to get funds if the goal will not be reached
    function getRefund() public {
        require(address(this).balance < goal);
        require(block.timestamp >= deadline);

        uint256 amount = pledgeOf[msg.sender];
        pledgeOf[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}