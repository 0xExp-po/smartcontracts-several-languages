// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Crowdfunding {
    address public owner;
    uint256 public deadline;
    uint256 public goal;
    mapping(address => uint256) public pledgeOf;

    constructor(uint256 _numberOfDays, uint256 _goal) {
        require(_numberOfDays > 0, "numberOfDays must be greater than zero");
        require(_goal > 0, "goal must be greater than zero");

        owner = msg.sender;
        deadline = block.timestamp + (_numberOfDays * 1 days);
        goal = _goal;
    }

    function pledge(uint256 amount) public payable {
        require(block.timestamp < deadline);
        require(msg.value == amount);

        pledgeOf[msg.sender] += amount;
    }

    function claimFunds() public {
        require(address(this).balance >= goal);
        require(block.timestamp >= deadline);
        require(msg.sender == owner);

        payable(msg.sender).transfer(address(this).balance);
    }

    function getRefund() public {
        require(address(this).balance < goal);
        require(block.timestamp >= deadline);

        uint256 amount = pledgeOf[msg.sender];
        pledgeOf[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}