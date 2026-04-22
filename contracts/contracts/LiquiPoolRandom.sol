// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { LiquiPoolVault } from "./LiquiPoolVault.sol";

/**
 * @title LiquiPoolRandom
 * @notice Lightweight randomness helper for local/testing environments.
 * @dev Production randomness can be swapped in later without changing the vault interface.
 */
contract LiquiPoolRandom {
    error LiquiPoolRandom__OnlyVault();

    LiquiPoolVault private immutable i_vaultContract;

    event RandomnessRequested(uint256 indexed round, uint256 randomWord);

    constructor(address vaultContract) {
        i_vaultContract = LiquiPoolVault(vaultContract);
    }

    function requestRandom(uint256 round) external returns (uint256 randomWord) {
        if (msg.sender != address(i_vaultContract)) revert LiquiPoolRandom__OnlyVault();

        randomWord = uint256(
            keccak256(abi.encode(block.prevrandao, block.timestamp, blockhash(block.number - 1), round))
        );

        i_vaultContract.memberIsRandomlySelected(randomWord);
        emit RandomnessRequested(round, randomWord);
    }

    function getVaultAddress() external view returns (address) {
        return address(i_vaultContract);
    }
}
