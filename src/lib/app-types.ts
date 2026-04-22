export type PoolLifecycleStatus =
  | "Enrollment"
  | "Active"
  | "Bidding"
  | "Paused"
  | "Completed"

export type PoolCategory =
  | "Bidding"
  | "Non-Bidding"
  | "Earnable"
  | "Non-Earnable"

export type ContributionState = "Pending" | "Paid" | "Grace Period" | "Defaulted"

export type RoundSettlementStatus =
  | "Open"
  | "Contribution Window"
  | "Bidding"
  | "Settled"
  | "Completed"

export type PoolRecord = {
  id: string
  name: string
  contributionAmount: number
  membersCount: number
  memberLimit: number
  currentRound: number
  totalRounds: number
  status: PoolLifecycleStatus
  lowestBid: number
  countdown: string
  securityDeposit: number
  remainingSlots: number
  biddingEnabled: boolean
  category: PoolCategory
  valueLocked: number
  completion: number
  settlementSummary: string
  chainId: number
  poolAddress?: string
  vaultAddress?: string
  tokenAddress?: string
}

export type MemberRecord = {
  name: string
  wallet: string
  reputation: number
  contributionStatus: string
  roundsReceived: number
}

export type RoundRecord = {
  round: number
  winner: string
  contributionStatus: string
  settlementStatus: string
}

export type TransactionRecord = {
  type: string
  amount: number
  status: string
  date: string
}

export type BidRecord = {
  member: string
  amount: number
  time: string
}

export type UserWorkspace = {
  id: string
  username: string
  email: string
  wallet: string | null
  reputation: number
  totalEarnings: number
  poolsJoined: number
  oauthProvider: string
  roles: string[]
}

export type SchedulerResult = {
  processedPools: number
  processedRounds: number
  emailsAttempted: number
}
