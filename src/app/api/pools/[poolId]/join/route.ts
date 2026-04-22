import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/mongoose"
import { PoolMemberModel } from "@/lib/db/models/pool-member"
import { PoolModel } from "@/lib/db/models/pool"
import { UserProfileModel } from "@/lib/db/models/user-profile"
import { WalletLinkModel } from "@/lib/db/models/wallet-link"
import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function POST(
  _request: Request,
  context: { params: Promise<{ poolId: string }> }
) {
  const session = await getAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { poolId } = await context.params
  await connectToDatabase()

  const [pool, wallet, profile] = await Promise.all([
    PoolModel.findOne({ slug: poolId }),
    WalletLinkModel.findOne({ authUserId: session.user.id, isPrimary: true }),
    UserProfileModel.findOne({ authUserId: session.user.id }),
  ])

  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 })
  }

  if (!wallet || !profile) {
    return NextResponse.json(
      { error: "Wallet and user profile must be linked first." },
      { status: 400 }
    )
  }

  const memberCount = await PoolMemberModel.countDocuments({ poolSlug: poolId })
  if (memberCount >= pool.memberLimit) {
    return NextResponse.json({ error: "Pool is already full." }, { status: 409 })
  }

  await PoolMemberModel.findOneAndUpdate(
    { poolSlug: poolId, authUserId: session.user.id },
    {
      poolSlug: poolId,
      authUserId: session.user.id,
      walletAddress: wallet.address,
      displayName: profile.username,
      reputation: profile.reputation,
      contributionStatus: "Pending",
      roundsReceived: 0,
      payoutReceived: false,
      enrollmentStatus: "Approved",
      autoPayEnabled: true,
    },
    { upsert: true, new: true }
  )

  pool.membersCount = await PoolMemberModel.countDocuments({ poolSlug: poolId })
  if (
    pool.membersCount >= pool.memberLimit &&
    pool.status === "Enrollment" &&
    pool.reviewStatus === "approved"
  ) {
    pool.status = "Active"
  }
  await pool.save()

  await UserProfileModel.updateOne(
    { authUserId: session.user.id },
    { $inc: { poolsJoined: 1 } }
  )

  return NextResponse.json({ ok: true })
}
