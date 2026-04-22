// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { LiquiPoolHandler } from "./LiquiPool.sol";

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title LiquiPoolVault
 * @notice Financial custody and settlement layer for a single rotating savings pool.
 * @dev Round flow:
 *      1. Manager starts a round.
 *      2. Members contribute during the primary or grace window.
 *      3. Optional bidding occurs after the contribution window closes.
 *      4. Settlement covers any defaults, selects a winner, and distributes funds.
 */
contract LiquiPoolVault {
    error LiquiPoolVault__OnlyPoolManager();
    error LiquiPoolVault__OnlyLiquiPoolRandom();
    error LiquiPoolVault__CallerIsNotEnrolledMember();
    error LiquiPoolVault__PoolNotActive();
    error LiquiPoolVault__PoolCurrentlyActive();
    error LiquiPoolVault__SecurityDepositNotLocked();
    error LiquiPoolVault__ContributionAlreadySubmitted();
    error LiquiPoolVault__ContributionWindowClosed();
    error LiquiPoolVault__ContributionWindowStillOpen();
    error LiquiPoolVault__RoundAlreadyOpen();
    error LiquiPoolVault__RoundNotOpen();
    error LiquiPoolVault__RoundNotSettled();
    error LiquiPoolVault__AllRoundsAlreadyCompleted();
    error LiquiPoolVault__BiddingDisabled();
    error LiquiPoolVault__BiddingRoundNotActive();
    error LiquiPoolVault__BiddingRoundCurrentlyActive();
    error LiquiPoolVault__BiddingRequiresClosedContributionWindow();
    error LiquiPoolVault__BidNotLowerThanCurrentLowest();
    error LiquiPoolVault__MemberAlreadyReceivedPayout();
    error LiquiPoolVault__NoSecurityDepositToRelease();
    error LiquiPoolVault__NotEnoughSecurityBalanceToContribute(address defaulter);
    error LiquiPoolVault__NotAllRoundsCompleted();
    error LiquiPoolVault__RandomAlreadySet();

    event SecurityDepositLocked(address indexed poolManager, uint256 amount);
    event SecurityDepositReleased(address indexed poolManager, uint256 amount);
    event ContributionReceived(address indexed member, uint256 round, uint256 amount);
    event BidSubmitted(address indexed bidder, uint256 bidAmount, uint256 round);
    event BiddingRoundOpened(uint256 round);
    event BiddingRoundClosed(uint256 round);
    event RoundStarted(uint256 round, uint256 contributionWindowStart);
    event RoundSettled(address indexed roundWinner, uint256 payoutAmount, uint256 round);
    event DefaultCoveredByPoolManager(address indexed defaultedMember, uint256 amount, uint256 round);
    event DefaultCoveredByPoolVault(address indexed defaultedMember, uint256 amount, uint256 round);
    event PoolCycleFinalized(uint256 totalRounds);
    event RandomRegistered(address indexed randomContract);

    LiquiPoolHandler private immutable i_poolHandler;
    IERC20Minimal private immutable i_poolToken;

    uint256 private s_currentRound;
    uint256 private s_roundContributionWindowStart;
    bool private s_isRoundOpen;
    bool private s_isCurrentRoundSettled = true;
    bool private s_isBiddingRoundActive;

    uint256 private s_currentLowestBid;
    address private s_currentLowestBidder;

    address[] private s_roundWinners;
    address[] private s_eligibleRecipients;

    mapping(address => bool) private s_hasReceivedPayout;
    mapping(address => bool) private s_hasContributedThisRound;
    mapping(address => bool) private s_contributedDuringGracePeriod;

    address private s_randomPool;
    uint256 private s_pendingRandomWord;
    bool private s_hasPendingRandomWord;

    constructor(address poolHandler, address poolToken) {
        i_poolHandler = LiquiPoolHandler(poolHandler);
        i_poolToken = IERC20Minimal(poolToken);
    }

    modifier onlyPoolManager() {
        if (msg.sender != i_poolHandler.getPoolManager()) {
            revert LiquiPoolVault__OnlyPoolManager();
        }
        _;
    }

    modifier onlyRandomContract() {
        if (msg.sender != s_randomPool) revert LiquiPoolVault__OnlyLiquiPoolRandom();
        _;
    }

    modifier onlyWhenPoolActive() {
        if (i_poolHandler.getPoolState() != LiquiPoolHandler.PoolState.ACTIVE) {
            revert LiquiPoolVault__PoolNotActive();
        }
        _;
    }

    modifier onlyWhenPoolNotActive() {
        if (i_poolHandler.getPoolState() == LiquiPoolHandler.PoolState.ACTIVE) {
            revert LiquiPoolVault__PoolCurrentlyActive();
        }
        _;
    }

    function registerPoolRandom(address randomContract) external onlyPoolManager {
        if (s_randomPool != address(0)) revert LiquiPoolVault__RandomAlreadySet();
        s_randomPool = randomContract;
        emit RandomRegistered(randomContract);
    }

    function memberIsRandomlySelected(uint256 randomNumber) external onlyRandomContract {
        s_pendingRandomWord = randomNumber;
        s_hasPendingRandomWord = true;
    }

    function lockSecurityDeposit() external onlyPoolManager {
        uint256 required = i_poolHandler.getRequiredSecurityDeposit();
        _safeTransferFrom(msg.sender, address(this), required);
        i_poolHandler.recordSecurityDepositLocked(required);
        emit SecurityDepositLocked(msg.sender, required);
    }

    function releaseSecurityDeposit() external onlyPoolManager onlyWhenPoolNotActive {
        if (i_poolHandler.getPoolState() != LiquiPoolHandler.PoolState.CONCLUDED) {
            revert LiquiPoolVault__NotAllRoundsCompleted();
        }

        uint256 amount = i_poolHandler.getSecurityDepositBalance();
        if (amount == 0) revert LiquiPoolVault__NoSecurityDepositToRelease();

        i_poolHandler.recordSecurityDepositReleased();
        _safeTransfer(i_poolHandler.getPoolManager(), amount);

        emit SecurityDepositReleased(i_poolHandler.getPoolManager(), amount);
    }

    function startNextRound() public onlyPoolManager onlyWhenPoolActive {
        if (!i_poolHandler.isSecurityDepositLocked()) revert LiquiPoolVault__SecurityDepositNotLocked();
        if (s_isRoundOpen) revert LiquiPoolVault__RoundAlreadyOpen();
        if (!s_isCurrentRoundSettled) revert LiquiPoolVault__RoundNotSettled();
        if (s_currentRound >= i_poolHandler.getTotalRounds()) revert LiquiPoolVault__AllRoundsAlreadyCompleted();

        address[] memory members = i_poolHandler.getEnrolledMembers();
        if (s_eligibleRecipients.length == 0) {
            s_eligibleRecipients = members;
        }

        for (uint256 index = 0; index < members.length; index++) {
            s_hasContributedThisRound[members[index]] = false;
            s_contributedDuringGracePeriod[members[index]] = false;
        }

        s_currentRound += 1;
        s_isRoundOpen = true;
        s_isCurrentRoundSettled = false;
        s_isBiddingRoundActive = false;
        s_currentLowestBid = 0;
        s_currentLowestBidder = address(0);
        s_roundContributionWindowStart = block.timestamp;

        emit RoundStarted(s_currentRound, block.timestamp);
    }

    function prepareNextRound() external {
        startNextRound();
    }

    function contributeMonthly() external onlyWhenPoolActive {
        if (!s_isRoundOpen) revert LiquiPoolVault__RoundNotOpen();
        if (s_isBiddingRoundActive) revert LiquiPoolVault__BiddingRoundCurrentlyActive();
        if (!i_poolHandler.isMemberEnrolled(msg.sender)) {
            revert LiquiPoolVault__CallerIsNotEnrolledMember();
        }
        if (s_hasContributedThisRound[msg.sender]) {
            revert LiquiPoolVault__ContributionAlreadySubmitted();
        }

        uint256 primaryDuration = i_poolHandler.getPrimaryWindowDuration();
        uint256 graceDuration = i_poolHandler.getGracePeriodDuration();
        uint256 elapsed = block.timestamp - s_roundContributionWindowStart;
        uint256 monthlyContribution = i_poolHandler.getMonthlyContributionAmount();
        uint256 amount = monthlyContribution;

        if (elapsed <= primaryDuration) {
            _safeTransferFrom(msg.sender, address(this), monthlyContribution);
            (,, , uint256 bonus,,,,) = i_poolHandler.getScoreConstants();
            i_poolHandler.increaseScore(msg.sender, bonus);
        } else if (elapsed <= primaryDuration + graceDuration) {
            uint256 graceFee = i_poolHandler.getGracePeriodPenaltyFee();
            _safeTransferFrom(msg.sender, address(this), monthlyContribution + graceFee);
            _safeTransfer(i_poolHandler.getPoolManager(), graceFee);
            s_contributedDuringGracePeriod[msg.sender] = true;
            (,,,,,, uint256 penalty,) = i_poolHandler.getScoreConstants();
            i_poolHandler.decreaseScore(msg.sender, penalty);
            amount += graceFee;
        } else {
            revert LiquiPoolVault__ContributionWindowClosed();
        }

        s_hasContributedThisRound[msg.sender] = true;
        emit ContributionReceived(msg.sender, s_currentRound, amount);
    }

    function submitContributionOnBehalfOf(address member) external onlyPoolManager onlyWhenPoolActive {
        if (!s_isRoundOpen) revert LiquiPoolVault__RoundNotOpen();
        if (s_isBiddingRoundActive) revert LiquiPoolVault__BiddingRoundCurrentlyActive();
        if (!i_poolHandler.isMemberEnrolled(member)) {
            revert LiquiPoolVault__CallerIsNotEnrolledMember();
        }
        if (s_hasContributedThisRound[member]) {
            revert LiquiPoolVault__ContributionAlreadySubmitted();
        }

        uint256 monthlyContribution = i_poolHandler.getMonthlyContributionAmount();
        _safeTransferFrom(msg.sender, address(this), monthlyContribution);
        s_hasContributedThisRound[member] = true;

        (,,,,,,, uint256 penaltyDefault) = i_poolHandler.getScoreConstants();
        i_poolHandler.decreaseScore(member, penaltyDefault);

        emit DefaultCoveredByPoolManager(member, monthlyContribution, s_currentRound);
    }

    function openBiddingRound() external onlyPoolManager onlyWhenPoolActive {
        if (!s_isRoundOpen) revert LiquiPoolVault__RoundNotOpen();
        if (!i_poolHandler.isBiddingEnabled()) revert LiquiPoolVault__BiddingDisabled();
        if (s_isBiddingRoundActive) revert LiquiPoolVault__BiddingRoundCurrentlyActive();
        if (_isContributionWindowOpen()) revert LiquiPoolVault__BiddingRequiresClosedContributionWindow();

        s_isBiddingRoundActive = true;
        s_currentLowestBid = type(uint256).max;
        s_currentLowestBidder = address(0);

        emit BiddingRoundOpened(s_currentRound);
    }

    function closeBiddingRound() external onlyPoolManager onlyWhenPoolActive {
        if (!s_isBiddingRoundActive) revert LiquiPoolVault__BiddingRoundNotActive();
        s_isBiddingRoundActive = false;
        emit BiddingRoundClosed(s_currentRound);
    }

    function submitBid(uint256 bidAmount) external onlyWhenPoolActive {
        if (!s_isRoundOpen) revert LiquiPoolVault__RoundNotOpen();
        if (!s_isBiddingRoundActive) revert LiquiPoolVault__BiddingRoundNotActive();
        if (!i_poolHandler.isMemberEnrolled(msg.sender)) {
            revert LiquiPoolVault__CallerIsNotEnrolledMember();
        }
        if (s_hasReceivedPayout[msg.sender]) revert LiquiPoolVault__MemberAlreadyReceivedPayout();
        if (bidAmount >= s_currentLowestBid) revert LiquiPoolVault__BidNotLowerThanCurrentLowest();

        s_currentLowestBid = bidAmount;
        s_currentLowestBidder = msg.sender;

        (,,,, uint256 bidBonus,,,) = i_poolHandler.getScoreConstants();
        i_poolHandler.increaseScore(msg.sender, bidBonus);

        emit BidSubmitted(msg.sender, bidAmount, s_currentRound);
    }

    function settleCurrentRound() external onlyPoolManager onlyWhenPoolActive {
        if (!s_isRoundOpen) revert LiquiPoolVault__RoundNotOpen();
        if (_isContributionWindowOpen()) revert LiquiPoolVault__ContributionWindowStillOpen();
        if (s_isBiddingRoundActive) revert LiquiPoolVault__BiddingRoundCurrentlyActive();

        address[] memory members = i_poolHandler.getEnrolledMembers();
        uint256 monthlyContribution = i_poolHandler.getMonthlyContributionAmount();
        uint256 totalPool = monthlyContribution * members.length;

        for (uint256 index = 0; index < members.length; index++) {
            if (!s_hasContributedThisRound[members[index]]) {
                _coverMemberDefault(members[index], monthlyContribution);
            }
        }

        address winner;
        uint256 payoutAmount;
        uint256 discountAmount;

        if (s_currentLowestBidder != address(0)) {
            winner = s_currentLowestBidder;
            discountAmount = s_currentLowestBid;
            payoutAmount = totalPool - discountAmount;

            (,,,,, uint256 winBonus,,) = i_poolHandler.getScoreConstants();
            i_poolHandler.increaseScore(winner, winBonus);

            _distributeDiscount(discountAmount, winner, members);
        } else {
            winner = _chooseFallbackWinner();
            payoutAmount = totalPool;
        }

        s_roundWinners.push(winner);
        s_hasReceivedPayout[winner] = true;
        _removeEligibleRecipient(winner);

        _safeTransfer(winner, payoutAmount);

        s_isRoundOpen = false;
        s_isCurrentRoundSettled = true;

        emit RoundSettled(winner, payoutAmount, s_currentRound);
    }

    function finalizePoolCycle() external onlyPoolManager {
        if (!s_isCurrentRoundSettled) revert LiquiPoolVault__RoundNotSettled();
        if (s_currentRound != i_poolHandler.getTotalRounds()) revert LiquiPoolVault__NotAllRoundsCompleted();
        i_poolHandler.concludePool();
        emit PoolCycleFinalized(s_currentRound);
    }

    function getCurrentRound() external view returns (uint256) {
        return s_currentRound;
    }

    function isRoundOpen() external view returns (bool) {
        return s_isRoundOpen;
    }

    function isBiddingRoundActive() external view returns (bool) {
        return s_isBiddingRoundActive;
    }

    function getCurrentLowestBid() external view returns (uint256) {
        return s_currentLowestBid;
    }

    function getCurrentLowestBidder() external view returns (address) {
        return s_currentLowestBidder;
    }

    function isCurrentRoundSettled() external view returns (bool) {
        return s_isCurrentRoundSettled;
    }

    function getRoundWinners() external view returns (address[] memory) {
        return s_roundWinners;
    }

    function hasMemberReceivedPayout(address member) external view returns (bool) {
        return s_hasReceivedPayout[member];
    }

    function hasMemberContributedThisRound(address member) external view returns (bool) {
        return s_hasContributedThisRound[member];
    }

    function contributedDuringGracePeriod(address member) external view returns (bool) {
        return s_contributedDuringGracePeriod[member];
    }

    function getMembersNotYetContributed() external view returns (address[] memory) {
        address[] memory members = i_poolHandler.getEnrolledMembers();
        address[] memory pending = new address[](members.length);
        uint256 count;

        for (uint256 index = 0; index < members.length; index++) {
            if (!s_hasContributedThisRound[members[index]]) {
                pending[count] = members[index];
                count++;
            }
        }

        assembly {
            mstore(pending, count)
        }
        return pending;
    }

    function getEligibleRecipients() external view returns (address[] memory) {
        return s_eligibleRecipients;
    }

    function getVaultTokenBalance() external view returns (uint256) {
        return i_poolToken.balanceOf(address(this));
    }

    function getPoolTokenAddress() external view returns (address) {
        return address(i_poolToken);
    }

    function _coverMemberDefault(address defaultingMember, uint256 monthlyContribution) internal {
        uint256 securityBalance = i_poolHandler.getSecurityDepositBalance();
        if (securityBalance < monthlyContribution) {
            revert LiquiPoolVault__NotEnoughSecurityBalanceToContribute(defaultingMember);
        }

        i_poolHandler.deductFromSecurityDeposit(monthlyContribution);
        s_hasContributedThisRound[defaultingMember] = true;

        (,,,,,,, uint256 penaltyDefault) = i_poolHandler.getScoreConstants();
        i_poolHandler.decreaseScore(defaultingMember, penaltyDefault);

        emit DefaultCoveredByPoolVault(defaultingMember, monthlyContribution, s_currentRound);
    }

    function _distributeDiscount(uint256 discountAmount, address winner, address[] memory members) internal {
        if (discountAmount == 0 || members.length <= 1) return;

        uint256 recipientCount = members.length - 1;
        uint256 share = discountAmount / recipientCount;
        uint256 paidTotal;

        if (share == 0) return;

        for (uint256 index = 0; index < members.length; index++) {
            if (members[index] == winner) continue;
            paidTotal += share;
            _safeTransfer(members[index], share);
        }

        uint256 dust = discountAmount - paidTotal;
        if (dust > 0) {
            _safeTransfer(i_poolHandler.getPoolManager(), dust);
        }
    }

    function _chooseFallbackWinner() internal returns (address) {
        uint256 eligibleCount = s_eligibleRecipients.length;
        uint256 randomWord = s_hasPendingRandomWord
            ? s_pendingRandomWord
            : uint256(keccak256(abi.encode(block.prevrandao, block.timestamp, s_currentRound, eligibleCount)));

        s_hasPendingRandomWord = false;
        s_pendingRandomWord = 0;

        uint256 index = randomWord % eligibleCount;
        return s_eligibleRecipients[index];
    }

    function _removeEligibleRecipient(address member) internal {
        uint256 length = s_eligibleRecipients.length;
        for (uint256 index = 0; index < length; index++) {
            if (s_eligibleRecipients[index] == member) {
                s_eligibleRecipients[index] = s_eligibleRecipients[length - 1];
                s_eligibleRecipients.pop();
                break;
            }
        }
    }

    function _isContributionWindowOpen() internal view returns (bool) {
        uint256 elapsed = block.timestamp - s_roundContributionWindowStart;
        uint256 primaryDuration = i_poolHandler.getPrimaryWindowDuration();
        uint256 graceDuration = i_poolHandler.getGracePeriodDuration();
        return elapsed <= primaryDuration + graceDuration;
    }

    function _safeTransfer(address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(i_poolToken).call(
            abi.encodeCall(IERC20Minimal.transfer, (to, amount))
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FAILED");
    }

    function _safeTransferFrom(address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(i_poolToken).call(
            abi.encodeCall(IERC20Minimal.transferFrom, (from, to, amount))
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TRANSFER_FROM_FAILED");
    }
}
