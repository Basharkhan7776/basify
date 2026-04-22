// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LiquiPoolHandler
 * @notice Pool identity, enrollment, lifecycle, and reputation controller for a single rotating savings pool.
 * @dev Financial custody and settlement live in LiquiPoolVault. This contract stores the protocol invariants
 *      that define a pool: fixed member count, fixed round count, contribution timing, and manager identity.
 */
contract LiquiPoolHandler {
    error LiquiPool__OnlyOwner();
    error LiquiPool__OnlyPoolManager();
    error LiquiPool__OnlyVaultContract();
    error LiquiPool__VaultAlreadySet();
    error LiquiPool__MemberAlreadyEnrolled();
    error LiquiPool__MemberNotEnrolled();
    error LiquiPool__MemberAlreadyRequested();
    error LiquiPool__MemberNotRequested();
    error LiquiPool__NotInEnrollmentPhase();
    error LiquiPool__EnrollmentCapacityReached();
    error LiquiPool__InvalidStateTransition();
    error LiquiPool__SecurityDepositNotLocked();
    error LiquiPool__EnrollmentIncomplete();
    error LiquiPool__SecurityDepositUnderflow();
    error LiquiPool__VaultNotSet();

    event EnrollmentRequested(address indexed applicant);
    event MemberEnrolled(address indexed member);
    event MemberRemoved(address indexed member);
    event VaultContractSet(address indexed vaultAddress);
    event PoolManagerTransferred(address indexed previousManager, address indexed newManager);
    event PoolStateChanged(PoolState indexed previousState, PoolState indexed newState);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event MemberScoreUpdated(address indexed member, uint256 indexed prevScore, uint256 indexed newScore);

    enum PoolState {
        ENROLLMENT,
        ACTIVE,
        SUSPENDED,
        CONCLUDED
    }

    address public s_owner;
    address public s_poolManager;

    uint256 private immutable s_memberLimit;
    uint256 private immutable s_totalRounds;
    bool private immutable s_biddingEnabled;
    uint256 private immutable s_monthlyContributionAmount;
    uint256 private immutable s_requiredSecurityDeposit;
    uint256 private immutable s_gracePeriodPenaltyFee;
    uint256 private immutable s_primaryWindowDuration;
    uint256 private immutable s_gracePeriodDuration;

    PoolState private s_poolState;
    address private s_vaultContract;
    bool private s_isSecurityDepositLocked;
    uint256 private s_securityDepositBalance;

    mapping(address => bool) private s_isMemberEnrolled;
    mapping(address => bool) private s_isMemberRequested;
    address[] private s_enrolledMembers;
    address[] private s_requestedMembers;

    mapping(address => uint256) private s_memberScore;
    mapping(address => bool) private s_isMemberScoreInitialized;

    uint256 private constant SCORE_INITIAL = 40;
    uint256 private constant SCORE_MAXIMUM = 100;
    uint256 private constant SCORE_MINIMUM = 0;
    uint256 private constant SCORE_BONUS_ON_TIME_CONTRIBUTION = 10;
    uint256 private constant SCORE_BONUS_BID_PARTICIPATION = 5;
    uint256 private constant SCORE_BONUS_BID_WINNER = 8;
    uint256 private constant SCORE_PENALTY_GRACE_PERIOD = 10;
    uint256 private constant SCORE_PENALTY_DEFAULT_COVERED = 35;

    constructor(
        address poolManager,
        uint256 memberLimit,
        uint256 totalRounds,
        bool biddingEnabled,
        uint256 monthlyContributionAmount,
        uint256 requiredSecurityDeposit,
        uint256 gracePeriodPenaltyFee,
        uint256 primaryWindowDuration,
        uint256 gracePeriodDuration
    ) {
        s_owner = msg.sender;
        s_poolManager = poolManager;
        s_memberLimit = memberLimit;
        s_totalRounds = totalRounds;
        s_biddingEnabled = biddingEnabled;
        s_monthlyContributionAmount = monthlyContributionAmount;
        s_requiredSecurityDeposit = requiredSecurityDeposit;
        s_gracePeriodPenaltyFee = gracePeriodPenaltyFee;
        s_primaryWindowDuration = primaryWindowDuration;
        s_gracePeriodDuration = gracePeriodDuration;
        s_poolState = PoolState.ENROLLMENT;
    }

    modifier onlyOwner() {
        if (msg.sender != s_owner) revert LiquiPool__OnlyOwner();
        _;
    }

    modifier onlyPoolManager() {
        if (msg.sender != s_poolManager) revert LiquiPool__OnlyPoolManager();
        _;
    }

    modifier onlyVaultContract() {
        if (msg.sender != s_vaultContract) revert LiquiPool__OnlyVaultContract();
        _;
    }

    modifier onlyDuringEnrollment() {
        if (s_poolState != PoolState.ENROLLMENT) revert LiquiPool__NotInEnrollmentPhase();
        _;
    }

    function requestEnrollment() external onlyDuringEnrollment {
        if (s_isMemberEnrolled[msg.sender]) revert LiquiPool__MemberAlreadyEnrolled();
        if (s_isMemberRequested[msg.sender]) revert LiquiPool__MemberAlreadyRequested();

        s_isMemberRequested[msg.sender] = true;
        s_requestedMembers.push(msg.sender);

        emit EnrollmentRequested(msg.sender);
    }

    function approveMemberEnrollment(address applicant) external onlyPoolManager onlyDuringEnrollment {
        if (!s_isMemberRequested[applicant]) revert LiquiPool__MemberNotRequested();
        if (s_isMemberEnrolled[applicant]) revert LiquiPool__MemberAlreadyEnrolled();
        if (s_enrolledMembers.length >= s_memberLimit) revert LiquiPool__EnrollmentCapacityReached();

        s_isMemberRequested[applicant] = false;
        _removeRequestedMember(applicant);

        s_isMemberEnrolled[applicant] = true;
        s_enrolledMembers.push(applicant);

        emit MemberEnrolled(applicant);
    }

    function removeMember(address member) external onlyPoolManager onlyDuringEnrollment {
        if (!s_isMemberEnrolled[member]) revert LiquiPool__MemberNotEnrolled();

        s_isMemberEnrolled[member] = false;
        _removeEnrolledMember(member);

        emit MemberRemoved(member);
    }

    function changePoolState(PoolState newState) external onlyPoolManager {
        PoolState previous = s_poolState;

        if (previous == PoolState.ENROLLMENT) {
            if (newState != PoolState.ACTIVE) revert LiquiPool__InvalidStateTransition();
            if (s_enrolledMembers.length != s_memberLimit) revert LiquiPool__EnrollmentIncomplete();
            if (!s_isSecurityDepositLocked) revert LiquiPool__SecurityDepositNotLocked();
            if (s_vaultContract == address(0)) revert LiquiPool__VaultNotSet();
        } else if (previous == PoolState.ACTIVE) {
            if (newState != PoolState.SUSPENDED) revert LiquiPool__InvalidStateTransition();
        } else if (previous == PoolState.SUSPENDED) {
            if (newState != PoolState.ACTIVE) revert LiquiPool__InvalidStateTransition();
        } else {
            revert LiquiPool__InvalidStateTransition();
        }

        s_poolState = newState;
        emit PoolStateChanged(previous, newState);
    }

    function concludePool() external onlyVaultContract {
        PoolState previous = s_poolState;
        s_poolState = PoolState.CONCLUDED;
        emit PoolStateChanged(previous, PoolState.CONCLUDED);
    }

    function recordSecurityDepositLocked(uint256 amount) external onlyVaultContract {
        s_isSecurityDepositLocked = true;
        s_securityDepositBalance += amount;
    }

    function recordSecurityDepositReleased() external onlyVaultContract {
        s_isSecurityDepositLocked = false;
        s_securityDepositBalance = 0;
    }

    function deductFromSecurityDeposit(uint256 amount) external onlyVaultContract {
        if (amount > s_securityDepositBalance) revert LiquiPool__SecurityDepositUnderflow();
        s_securityDepositBalance -= amount;
    }

    function increaseScore(address member, uint256 points) external onlyVaultContract {
        _initializeMemberScore(member);
        uint256 previous = s_memberScore[member];
        uint256 updated = previous + points;
        if (updated > SCORE_MAXIMUM) updated = SCORE_MAXIMUM;
        s_memberScore[member] = updated;
        emit MemberScoreUpdated(member, previous, updated);
    }

    function decreaseScore(address member, uint256 points) external onlyVaultContract {
        _initializeMemberScore(member);
        uint256 previous = s_memberScore[member];
        uint256 updated = previous > points ? previous - points : SCORE_MINIMUM;
        s_memberScore[member] = updated;
        emit MemberScoreUpdated(member, previous, updated);
    }

    function transferPoolManager(address newManager) external onlyOwner {
        address previous = s_poolManager;
        s_poolManager = newManager;
        emit PoolManagerTransferred(previous, newManager);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        address previous = s_owner;
        s_owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    function updateVaultContractAddress(address vaultContractAddress) external onlyOwner {
        if (s_vaultContract != address(0)) revert LiquiPool__VaultAlreadySet();
        s_vaultContract = vaultContractAddress;
        emit VaultContractSet(vaultContractAddress);
    }

    function getPoolManager() external view returns (address) {
        return s_poolManager;
    }

    function getPoolState() external view returns (PoolState) {
        return s_poolState;
    }

    function isMemberEnrolled(address member) external view returns (bool) {
        return s_isMemberEnrolled[member];
    }

    function isMemberRequestedToEnroll(address member) external view returns (bool) {
        return s_isMemberRequested[member];
    }

    function getEnrolledMembers() external view returns (address[] memory) {
        return s_enrolledMembers;
    }

    function getRequestedMembers() external view returns (address[] memory) {
        return s_requestedMembers;
    }

    function getEnrolledMemberCount() external view returns (uint256) {
        return s_enrolledMembers.length;
    }

    function getRequestedMemberCount() external view returns (uint256) {
        return s_requestedMembers.length;
    }

    function getMemberLimit() external view returns (uint256) {
        return s_memberLimit;
    }

    function getTotalRounds() external view returns (uint256) {
        return s_totalRounds;
    }

    function isBiddingEnabled() external view returns (bool) {
        return s_biddingEnabled;
    }

    function getMemberScore(address member) public view returns (uint256) {
        if (!s_isMemberScoreInitialized[member]) return SCORE_INITIAL;
        return s_memberScore[member];
    }

    function getMemberStarRating(address member) external view returns (uint256) {
        uint256 score = getMemberScore(member);
        if (score <= 20) return 1;
        if (score <= 40) return 2;
        if (score <= 60) return 3;
        if (score <= 80) return 4;
        return 5;
    }

    function getScoreConstants()
        external
        pure
        returns (
            uint256 initial,
            uint256 maximum,
            uint256 minimum,
            uint256 bonusOnTime,
            uint256 bonusBid,
            uint256 bonusWinner,
            uint256 penaltyGrace,
            uint256 penaltyDefault
        )
    {
        return (
            SCORE_INITIAL,
            SCORE_MAXIMUM,
            SCORE_MINIMUM,
            SCORE_BONUS_ON_TIME_CONTRIBUTION,
            SCORE_BONUS_BID_PARTICIPATION,
            SCORE_BONUS_BID_WINNER,
            SCORE_PENALTY_GRACE_PERIOD,
            SCORE_PENALTY_DEFAULT_COVERED
        );
    }

    function getMonthlyContributionAmount() external view returns (uint256) {
        return s_monthlyContributionAmount;
    }

    function getRequiredSecurityDeposit() external view returns (uint256) {
        return s_requiredSecurityDeposit;
    }

    function getGracePeriodPenaltyFee() external view returns (uint256) {
        return s_gracePeriodPenaltyFee;
    }

    function isSecurityDepositLocked() external view returns (bool) {
        return s_isSecurityDepositLocked;
    }

    function getSecurityDepositBalance() external view returns (uint256) {
        return s_securityDepositBalance;
    }

    function getPrimaryWindowDuration() external view returns (uint256) {
        return s_primaryWindowDuration;
    }

    function getGracePeriodDuration() external view returns (uint256) {
        return s_gracePeriodDuration;
    }

    function _initializeMemberScore(address member) internal {
        if (!s_isMemberScoreInitialized[member]) {
            s_isMemberScoreInitialized[member] = true;
            s_memberScore[member] = SCORE_INITIAL;
        }
    }

    function _removeRequestedMember(address member) internal {
        uint256 length = s_requestedMembers.length;
        for (uint256 index = 0; index < length; index++) {
            if (s_requestedMembers[index] == member) {
                s_requestedMembers[index] = s_requestedMembers[length - 1];
                s_requestedMembers.pop();
                break;
            }
        }
    }

    function _removeEnrolledMember(address member) internal {
        uint256 length = s_enrolledMembers.length;
        for (uint256 index = 0; index < length; index++) {
            if (s_enrolledMembers[index] == member) {
                s_enrolledMembers[index] = s_enrolledMembers[length - 1];
                s_enrolledMembers.pop();
                break;
            }
        }
    }
}
