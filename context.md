# Project Context — Decentralized Rotating Savings Protocol

## 1. Overview

This project is a Web3-based rotating savings and liquidity protocol inspired by traditional community finance systems such as Bachat, Committee, ROSCA, or Chit Funds. The goal is to transform a trust-based financial coordination model into a programmable, transparent, and automated system using smart contracts.

In traditional systems, participants rely on social trust and manual enforcement. In this protocol, rules are enforced by code, funds are secured by smart contracts, and participant behavior is tracked through reputation mechanisms.

The system is designed to function as financial infrastructure rather than a simple savings application. It enables predictable liquidity access, disciplined savings, and community-based credit coordination without centralized trust.

---

## 2. Problem Statement

Traditional rotating savings systems face several structural problems:

* Default risk when members fail to contribute
* Lack of transparency in fund handling
* Manual coordination and bookkeeping
* Disputes due to trust breakdown
* Limited scalability beyond small communities
* No programmable enforcement of rules

In digital environments, these systems cannot scale without automation, verifiable accounting, and enforceable guarantees.

---

## 3. Core Solution

The protocol introduces a deterministic, automated rotating liquidity system with the following properties:

* Fixed group of participants contribute funds periodically
* One participant receives the full pool each round
* Smart contracts enforce contribution deadlines
* Security deposits guarantee settlement continuity
* Auctions or random selection determine payout order
* Reputation scoring tracks reliability and discipline
* All financial operations are transparent and auditable

The system ensures that every round completes even if a participant defaults.

---

## 4. Core Concepts

### Pool

A pool is a fixed group of members who agree to contribute a predefined amount at regular intervals.

Key properties:

* Fixed member count
* Fixed contribution amount
* Fixed number of rounds
* One payout per member per cycle

### Round

A round represents one contribution cycle where:

* All members submit contributions
* One member receives the payout
* Settlement distributes funds

### Cycle

A cycle is completed when every member has received exactly one payout.

After completion:

* The pool resets
* A new cycle may begin

### Contribution

A contribution is the fixed amount each member must pay in every round.

Total pool value per round:

Pool Value = Number of Members × Contribution Amount

### Security Deposit

The pool manager locks funds into the system before activation.

Purpose:

* Guarantee payout continuity
* Cover missing contributions
* Maintain system trust

The deposit acts as financial insurance.

### Reputation Score

Each member has a reliability score based on behavior.

Used for:

* Risk assessment
* Member selection
* Trust visibility
* System incentives

---

## 5. Participants

### Pool Manager

Responsibilities:

* Create and configure pools
* Lock security deposit
* Activate and manage rounds
* Trigger settlement
* Handle exceptional scenarios

Financial Role:

* Provides guarantee for pool stability

### Member

Responsibilities:

* Join pool
* Submit contributions on time
* Participate in bidding (optional)
* Maintain good standing

Members are liquidity participants, not investors.

### Protocol

Responsibilities:

* Enforce rules automatically
* Track contributions and payouts
* Calculate settlements
* Maintain transparency
* Prevent system failure

The protocol is the execution engine.

---

## 6. Pool Lifecycle

The pool operates as a finite state machine.

States:

Enrollment
Active
Suspended
Concluded

### Enrollment

Members join the pool.
The manager prepares the system.
No financial operations occur yet.

### Active

The pool is operational.
Members contribute funds.
Rounds execute normally.

### Suspended

Operations pause temporarily.
Used for maintenance or risk control.

### Concluded

All rounds are completed.
The cycle ends.
Funds are finalized.

---

## 7. Round Flow

Each round follows a strict sequence of events.

1. Contribution window opens
2. Members submit contributions
3. Grace period allows late payments
4. Default handling executes if necessary
5. Bidding or selection determines winner
6. Settlement distributes funds
7. Next round begins

The sequence must be deterministic.

---

## 8. Contribution Windows

Each round contains two payment periods.

### Primary Window

Members contribute on time.
No penalties apply.

### Grace Period

Late contributions are allowed.
Penalty fees apply.

### After Grace Period

Unpaid contributions are classified as defaults.

---

## 9. Default Handling

The system guarantees settlement continuity.

If a member fails to contribute:

Option 1:
The manager covers the payment manually.

Option 2:
The protocol automatically deducts the missing amount from the manager's security deposit.

This ensures:

* No round failure
* No payout interruption
* System reliability

---

## 10. Payout Determination

The protocol supports two payout mechanisms.

### Bidding Mechanism

Eligible members submit bids to receive the payout early.

Rules:

* Only members who have not received a payout can bid
* Each new bid must be lower than the previous bid
* The lowest bid wins

Purpose:

* Provide liquidity to members with urgent needs
* Reward disciplined participation

### Random Selection

If no bids are submitted:

The system randomly selects an eligible member.

Purpose:

* Prevent deadlock
* Ensure progress

---

## 11. Settlement

Settlement is the final step of each round.

The protocol performs the following actions automatically:

* Verify all contributions
* Determine payout recipient
* Transfer funds
* Distribute dividends
* Update reputation scores
* Record transaction history

Settlement must be atomic.

Meaning:

Either all operations succeed or none do.

---

## 12. Economic Model

Inputs:

Members (N)
Contribution Amount (C)
Rounds (R)

Derived Value:

Pool Value per Round = N × C

Revenue Sources:

* Penalty fees
* Auction spread
* Treasury allocation
* Platform service fees

---

## 13. System Goals

Primary objectives:

* Guarantee payout reliability
* Enforce financial discipline
* Provide predictable liquidity
* Enable transparent coordination
* Remove dependency on trust
* Support scalable community finance

---

## 14. Non-Goals

The system is not designed to:

* Function as a speculative investment platform
* Replace banks directly
* Provide unsecured lending
* Guarantee financial returns

It is a coordination mechanism for structured savings and liquidity distribution.

---

## 15. Design Principles

Deterministic behavior

All outcomes must be predictable and rule-based.

Transparency

All financial activity must be verifiable.

Security

Funds must remain protected at all times.

Fault Tolerance

The system must continue operating even when participants fail.

Simplicity

Core logic must remain understandable and auditable.

---

## 16. Target Use Cases

Community savings groups

Freelancer income smoothing

Small business working capital

Startup founder liquidity planning

Microfinance coordination

DAO treasury distribution

Family or cooperative savings

---

## 17. Future Expansion

Multi-pool networks

Cross-chain deployment

Credit scoring integration

On-chain identity verification

Insurance-backed pools

Automated risk pricing

Institutional liquidity pools

---

## 18. Terminology Reference

Pool
A group of participants sharing contributions.

Round
One contribution and payout cycle.

Cycle
Completion of all rounds.

Contribution
Periodic payment into the pool.

Default
Failure to contribute on time.

Settlement
Distribution of funds after each round.

Vault
Secure storage for pooled funds.

Treasury
Protocol-owned funds.

Reputation
Reliability score of participants.

---

## 19. One-Line System Definition

A programmable rotating liquidity protocol that guarantees settlement, enforces discipline, and coordinates community finance without requiring trust.

