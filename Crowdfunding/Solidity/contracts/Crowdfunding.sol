// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Crowdfunding {
    address public owner;
    uint256 public deadline;
    uint256 public goal;
    mapping(address => uint256) public pledgeOf;

    constructor(uint256 numberOfDays, uint256 _goal) {
        owner = msg.sender;
        deadline = block.timestamp + (numberOfDays * 1 days);
        goal = _goal;
    }

    // TODO: add tests
}