import { differenceInMinutes, formatDistanceToNowStrict } from "date-fns"

import type {
  MemberRecord,
  PoolRecord,
  RoundRecord,
  UserWorkspace,
} from "@/lib/app-types"
import { getDefaultRoles } from "@/lib/access"
import { connectToDatabase } from "@/lib/mongoose"
import { PoolMemberModel } from "@/lib/db/models/pool-member"
import { PoolModel } from "@/lib/db/models/pool"
import { PoolRoundModel } from "@/lib/db/models/pool-round"
import { UserProfileModel } from "@/lib/db/models/user-profile"
import { ensureSeedData, getSeedBids, getSeedTransactions } from "@/lib/seed"

function formatCountdown(date?: Date | null) {
  if (!date) {
    return "Settled"
  }

  if (date.getTime() <= Date.now()) {
    return "Due now"
  }

  return formatDistanceToNowStrict(date)
}

function asPoolRecord(pool: {
  slug: string
  name: string
  contributionAmount: number
  membersCount: number
  memberLimit: number
  currentRound: number
  totalRounds: number
  status: string
  lowestBid: number
  securityDeposit: number
  biddingEnabled: boolean
  category: string
  settlementSummary: string
  countdownAt?: Date | null
  chainId: number
  poolAddress?: string
  vaultAddress?: string
  tokenAddress?: string
}): PoolRecord {
  const valueLocked = pool.contributionAmount * pool.memberLimit * pool.totalRounds
  const completion =
    pool.totalRounds === 0
      ? 0
      : Math.min(100, Math.round((pool.currentRound / pool.totalRounds) * 100))

  return {
    id: pool.slug,
    name: pool.name,
    contributionAmount: pool.contributionAmount,
    membersCount: pool.membersCount,
    memberLimit: pool.memberLimit,
    currentRound: pool.currentRound,
    totalRounds: pool.totalRounds,
    status: pool.status as PoolRecord["status"],
    lowestBid: pool.lowestBid,
    countdown: formatCountdown(pool.countdownAt),
    securityDeposit: pool.securityDeposit,
    remainingSlots: Math.max(0, pool.memberLimit - pool.membersCount),
    biddingEnabled: pool.biddingEnabled,
    category: pool.category as PoolRecord["category"],
    valueLocked,
    completion,
    settlementSummary: pool.settlementSummary,
    chainId: pool.chainId,
    poolAddress: pool.poolAddress,
    vaultAddress: pool.vaultAddress,
    tokenAddress: pool.tokenAddress,
  }
}

export async function getPoolsData() {
  await ensureSeedData()
  await connectToDatabase()

  const pools = await PoolModel.find().sort({ createdAt: -1 }).lean()
  return pools.map((pool) => asPoolRecord(pool))
}

export async function getPoolDetails(poolId: string) {
  await ensureSeedData()
  await connectToDatabase()

  const pool = await PoolModel.findOne({ slug: poolId }).lean()
  if (!pool) {
    return null
  }

  const members = await PoolMemberModel.find({ poolSlug: poolId }).lean()
  const rounds = await PoolRoundModel.find({ poolSlug: poolId })
    .sort({ roundNumber: 1 })
    .lean()

  const poolRecord = asPoolRecord(pool)

  const memberRecords: MemberRecord[] = members.map((member) => ({
    name: member.displayName,
    wallet: member.walletAddress,
    reputation: member.reputation,
    contributionStatus: member.contributionStatus,
    roundsReceived: member.roundsReceived,
  }))

  const roundRecords: RoundRecord[] = rounds.map((round) => ({
    round: round.roundNumber,
    winner: round.winnerName,
    contributionStatus: round.settlementSummary || round.status,
    settlementStatus: round.status,
  }))

  return {
    pool: poolRecord,
    members: memberRecords,
    rounds: roundRecords,
    bids: getSeedBids(poolId),
    transactions: getSeedTransactions(poolId),
  }
}

export async function getWorkspace(authUserId?: string | null) {
  await ensureSeedData()
  await connectToDatabase()

  if (!authUserId) {
    return null
  }

  const profile = await UserProfileModel.findOne({ authUserId }).lean()
  if (!profile) {
    return null
  }

  const joinedCount = await PoolMemberModel.countDocuments({ authUserId })

  return {
    id: profile.authUserId,
    username: profile.username,
    email: profile.email,
    wallet: profile.primaryWalletAddress ?? null,
    reputation: profile.reputation,
    totalEarnings: profile.totalEarnings,
    poolsJoined: joinedCount || profile.poolsJoined,
    oauthProvider: profile.oauthProvider,
    roles: profile.roles ?? getDefaultRoles(profile.email),
  } satisfies UserWorkspace
}

export async function upsertWorkspaceFromSession(input: {
  authUserId: string
  email: string
  username: string
  image?: string | null
  oauthProvider?: string
}) {
  await connectToDatabase()

  return UserProfileModel.findOneAndUpdate(
    { authUserId: input.authUserId },
    {
      authUserId: input.authUserId,
      email: input.email,
      username: input.username,
      image: input.image ?? "",
      oauthProvider: input.oauthProvider ?? "oauth",
      roles: getDefaultRoles(input.email),
    },
    { upsert: true, new: true }
  )
}

export async function getDashboardSnapshot(authUserId?: string | null) {
  const [workspace, pools] = await Promise.all([
    getWorkspace(authUserId),
    getPoolsData(),
  ])

  const activePools = pools.filter((pool) => pool.status === "Active" || pool.status === "Bidding")
  const pendingContributions = activePools.reduce((sum, pool) => sum + pool.contributionAmount, 0)

  return {
    workspace,
    stats: [
      {
        label: "Active Pools",
        value: `${activePools.length}`.padStart(2, "0"),
        detail: `${pools.filter((pool) => pool.status === "Bidding").length} bidding windows open`,
      },
      {
        label: "Pending Contributions",
        value: `$${pendingContributions.toLocaleString()}`,
        detail: activePools[0]?.countdown
          ? `Next due in ${activePools[0].countdown}`
          : "No dues pending",
      },
      {
        label: "Total Earnings",
        value: `$${(workspace?.totalEarnings ?? 0).toLocaleString()}`,
        detail: "Across completed and active pools",
      },
      {
        label: "Reputation Score",
        value: `${workspace?.reputation ?? 0}`,
        detail: "Auto-pay rating and contribution consistency",
      },
    ],
    pools,
  }
}

export async function getAdminSnapshot() {
  const pools = await getPoolsData()
  await connectToDatabase()

  const users = await UserProfileModel.find().sort({ createdAt: -1 }).limit(5).lean()
  const poolDocs = await PoolModel.find().sort({ createdAt: -1 }).limit(5).lean()

  return {
    stats: [
      {
        label: "Total Users",
        value: `${await UserProfileModel.countDocuments()}`,
        detail: "OAuth accounts with workspace records",
      },
      {
        label: "Total Pools",
        value: `${await PoolModel.countDocuments()}`,
        detail: "Across Sepolia-linked and seeded pools",
      },
      {
        label: "Total Value Locked",
        value: `$${pools.reduce((sum, pool) => sum + pool.valueLocked, 0).toLocaleString()}`,
        detail: "Modeled TVL from contribution schedules",
      },
      {
        label: "Active Rounds",
        value: `${pools.filter((pool) => pool.status !== "Completed").length}`,
        detail: `${await PoolModel.countDocuments({ reviewStatus: "pending" })} pools awaiting reviewer approval`,
      },
    ],
    recentUsers: users.map((user) => ({
      name: user.username,
      email: user.email,
      joined: user.createdAt,
    })),
    recentPools: poolDocs.map((pool) => ({
      name: pool.name,
      status: pool.status,
      members: `${pool.membersCount}/${pool.memberLimit}`,
      round: `${pool.currentRound}/${pool.totalRounds}`,
    })),
  }
}

export function getPoolWindowMeta(pool: {
  countdownAt: Date | null
  roundDurationHours: number
}) {
  const countdownMinutes = pool.countdownAt
    ? Math.max(0, differenceInMinutes(pool.countdownAt, new Date()))
    : 0

  return {
    countdownMinutes,
    windowHours: pool.roundDurationHours,
  }
}
