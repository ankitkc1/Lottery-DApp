// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract lottery {
    address public manager;
    address[] public participants;
    address public winner;

    constructor() {
        manager = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == manager, "Only the manager can call this function");
        _;
    }

    function enter() public payable {
        require(msg.value == 200000000 gwei, "Contribution must be exactly 0.2 ether");
        require(participants.length < 5, "Maximum participants reached");

        participants.push(msg.sender);

        if (participants.length == 5) {
            pickWinner();
        }
    }

    function pickWinner() internal {
        require(participants.length == 5, "Not enough participants yet");

        // Select a random winner using an external source of randomness
        uint256 index = getRandomIndex(participants.length);
        winner = participants[index];

        // Transfer 2 ether to the winner
        payable(winner).transfer(800000000 gwei);

        // Transfer 0.5 ether to the owner
        payable(manager).transfer(200000000 gwei);

        // Reset participants for the next round
        participants = new address[](0);
    }

    function getParticipants() public view returns (address[] memory) {
        return participants;
    }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getRandomIndex(uint256 max) internal view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(blockhash(block.number - 1), block.timestamp))) % max;
    }
}
