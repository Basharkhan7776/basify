import { addHours } from "date-fns"

import type { SchedulerResult } from "@/lib/app-types"
import { env } from "@/lib/env"
import { evaluatePoolMakerAutopay } from "@/lib/gemini"
import { sendProtocolEmail } from "@/lib/mailer"
import { connectToDatabase } from "@/lib/mongoose"
import { PoolMemberModel } from "@/lib/db/models/pool-member"
import { PoolModel } from "@/lib/db/models/pool"
import { PoolRoundModel } from "@/lib/db/models/pool-round"
import { SchedulerJobModel } from "@/lib/db/models/scheduler-job"
import { UserProfileModel } from "@/lib/db/models/user-profile"

export async function processDueRounds(): Promise<SchedulerResult> {
  await connectToDatabase()

  const duePools = await PoolModel.find({
    status: { $in: ["Active", "Bidding", "Enrollment"] },
    countdownAt: { $ne: null, $lte: new Date() },
  }).lean()

  let processedRounds = 0
  let emailsAttempted = 0

  for (const pool of duePools) {
    const jobKey = `round:${pool.slug}:${pool.currentRound + 1}`
    const existingJob = await SchedulerJobModel.findOne({ key: jobKey }).lean()

    if (existingJob?.status === "completed") {
      continue
    }

    await SchedulerJobModel.updateOne(
      { key: jobKey },
      {
        key: jobKey,
        status: "running",
        startedAt: new Date(),
        payload: { poolSlug: pool.slug, currentRound: pool.currentRound + 1 },
      },
      { upsert: true }
    )

    const nextRound = pool.currentRound + 1
    const members = await PoolMemberModel.find({ poolSlug: pool.slug }).lean()
    const poolMaker = await UserProfileModel.findOne({
      authUserId: pool.creatorUserId,
    }).lean()

    if (members.length === 0) {
      continue
    }

    const dueProfiles = await UserProfileModel.find({
      authUserId: { $in: members.map((member) => member.authUserId) },
    }).lean()

    for (const member of members) {
      const aiDecision = await evaluatePoolMakerAutopay({
        poolName: pool.name,
        poolMakerName: poolMaker?.username ?? "Pool Maker",
        poolMakerRating: poolMaker?.reputation ?? 70,
        contributionAmount: pool.contributionAmount,
        memberCount: members.length,
        currentRound: nextRound,
        totalRounds: pool.totalRounds,
      })

      await PoolMemberModel.updateOne(
        { _id: member._id },
        {
          contributionStatus: aiDecision.shouldFail ? "Defaulted" : "Paid",
          reputation: aiDecision.shouldFail
            ? Math.max(0, member.reputation - 8)
            : Math.min(100, member.reputation + 2),
        }
      )

      const profile = dueProfiles.find((item) => item.authUserId === member.authUserId)
      if (profile?.email) {
        emailsAttempted += 1
        await sendProtocolEmail({
          to: profile.email,
          subject: aiDecision.shouldFail
            ? `Auto-pay missed for ${pool.name}`
            : `Contribution processed for ${pool.name}`,
          text: aiDecision.shouldFail
            ? `The AI scheduler marked round ${nextRound} as failed using the pool maker rating. ${aiDecision.summary}`
            : `Your round ${nextRound} contribution for ${pool.name} was processed successfully. ${aiDecision.summary}`,
        })
      }
    }

    const winner = members
      .slice()
      .sort((a, b) => b.reputation - a.reputation)[0]

    await PoolRoundModel.updateOne(
      { poolSlug: pool.slug, roundNumber: nextRound },
      {
        poolSlug: pool.slug,
        roundNumber: nextRound,
        status: nextRound >= pool.totalRounds ? "Completed" : "Settled",
        winnerName: winner.displayName,
        winnerWallet: winner.walletAddress,
        settlementSummary: `${members.filter((member) => member.contributionStatus === "Defaulted").length} defaults evaluated through the pool maker rating AI.`,
        contributionWindowStartsAt: new Date(),
        contributionWindowEndsAt: addHours(new Date(), env.cronMonthDurationHours),
      },
      { upsert: true }
    )

    await PoolMemberModel.updateOne(
      { _id: winner._id },
      {
        roundsReceived: winner.roundsReceived + 1,
        payoutReceived: true,
      }
    )

    await PoolModel.updateOne(
      { _id: pool._id },
      {
        currentRound: nextRound,
        status: nextRound >= pool.totalRounds ? "Completed" : pool.biddingEnabled ? "Bidding" : "Active",
        countdownAt:
          nextRound >= pool.totalRounds
            ? null
            : addHours(new Date(), env.cronMonthDurationHours),
        settlementSummary: `Round ${nextRound} processed by the Gemini-backed scheduler using the pool maker rating.`,
        membersCount: members.length,
      }
    )

    await SchedulerJobModel.updateOne(
      { key: jobKey },
      {
        status: "completed",
        completedAt: new Date(),
        lastError: "",
      }
    )

    processedRounds += 1
  }

  return {
    processedPools: duePools.length,
    processedRounds,
    emailsAttempted,
  }
}
