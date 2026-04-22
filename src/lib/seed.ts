import {
  bidsByPool,
  getPoolById,
  membersByPool,
  pools,
  roundsByPool,
  transactionsByPool,
  userProfile,
} from "@/lib/mock-data"
import { connectToDatabase } from "@/lib/mongoose"
import { PoolMemberModel } from "@/lib/db/models/pool-member"
import { PoolModel } from "@/lib/db/models/pool"
import { PoolRoundModel } from "@/lib/db/models/pool-round"
import { UserProfileModel } from "@/lib/db/models/user-profile"

export async function ensureSeedData() {
  await connectToDatabase()

  const count = await PoolModel.countDocuments()
  if (count > 0) {
    return
  }

  await PoolModel.insertMany(
    pools.map((pool) => ({
      slug: pool.id,
      name: pool.name,
      status: pool.status,
      category: pool.category,
      contributionAmount: pool.contributionAmount,
      memberLimit: pool.memberLimit,
      membersCount: pool.membersCount,
      totalRounds: pool.totalRounds,
      currentRound: pool.currentRound,
      securityDeposit: pool.securityDeposit,
      gracePeriodDurationHours: 1,
      roundDurationHours: 1,
      biddingEnabled: pool.biddingEnabled,
      lowestBid: pool.lowestBid,
      settlementSummary: pool.settlementSummary,
      countdownAt:
        pool.countdown === "Settled"
          ? null
          : new Date(Date.now() + 60 * 60 * 1000),
      chainId: 11155111,
      creatorUserId: "seed-user",
      creatorWallet: userProfile.wallet,
      tokenAddress: "",
      poolAddress: "",
      vaultAddress: "",
      reviewStatus: "approved",
    }))
  )

  await Promise.all(
    pools.flatMap((pool) =>
      (membersByPool[pool.id] ?? []).map((member, index) =>
        PoolMemberModel.create({
          poolSlug: pool.id,
          authUserId: `seed-member-${pool.id}-${index}`,
          walletAddress: member.wallet,
          displayName: member.name,
          reputation: member.reputation,
          contributionStatus: member.contributionStatus,
          roundsReceived: member.roundsReceived,
        })
      )
    )
  )

  await Promise.all(
    pools.flatMap((pool) =>
      (roundsByPool[pool.id] ?? []).map((round) =>
        PoolRoundModel.create({
          poolSlug: pool.id,
          roundNumber: round.round,
          status: round.settlementStatus,
          winnerName: round.winner,
          settlementSummary: round.contributionStatus,
        })
      )
    )
  )

  await UserProfileModel.updateOne(
    { authUserId: "seed-user" },
    {
      authUserId: "seed-user",
      email: "seed@basify.app",
      username: userProfile.username,
      reputation: userProfile.reputation,
      totalEarnings: userProfile.totalEarnings,
      poolsJoined: userProfile.poolsJoined,
      primaryWalletAddress: userProfile.wallet,
      oauthProvider: "seed",
      roles: ["member", "pool-maker", "reviewer"],
    },
    { upsert: true }
  )
}

export function getSeedTransactions(poolId: string) {
  return transactionsByPool[poolId] ?? []
}

export function getSeedBids(poolId: string) {
  return bidsByPool[poolId] ?? []
}

export function getSeedPool(poolId: string) {
  return getPoolById(poolId)
}
