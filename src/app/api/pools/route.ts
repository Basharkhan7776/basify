import { addHours } from "date-fns"
import { NextResponse } from "next/server"
import { z } from "zod"

import { hasRole } from "@/lib/access"
import { deployPoolOnchain } from "@/lib/onchain"
import { connectToDatabase } from "@/lib/mongoose"
import { PoolModel } from "@/lib/db/models/pool"
import { UserProfileModel } from "@/lib/db/models/user-profile"
import { WalletLinkModel } from "@/lib/db/models/wallet-link"
import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

const createPoolSchema = z.object({
  name: z.string().min(3).max(80),
  contributionAmount: z.coerce.number().positive(),
  numberOfMembers: z.coerce.number().int().min(2).max(50),
  numberOfRounds: z.coerce.number().int().min(2).max(50),
  roundDuration: z.coerce.number().positive(),
  biddingEnabled: z.coerce.boolean(),
  securityDepositAmount: z.coerce.number().nonnegative(),
  gracePeriodDuration: z.coerce.number().nonnegative(),
  penaltyPercentage: z.coerce.number().min(0).max(100),
})

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function GET() {
  await connectToDatabase()
  const pools = await PoolModel.find().sort({ createdAt: -1 }).lean()
  return NextResponse.json({ pools })
}

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = createPoolSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await connectToDatabase()

  const [wallet, profile] = await Promise.all([
    WalletLinkModel.findOne({
      authUserId: session.user.id,
      isPrimary: true,
    }).lean(),
    UserProfileModel.findOne({
      authUserId: session.user.id,
    }).lean(),
  ])

  if (!wallet) {
    return NextResponse.json(
      { error: "A primary wallet must be linked before creating a pool." },
      { status: 400 }
    )
  }

  if (!hasRole(profile?.roles, "pool-maker")) {
    return NextResponse.json(
      { error: "Only pool makers can create pools." },
      { status: 403 }
    )
  }

  const slugBase = slugify(parsed.data.name)
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`
  const onchain = await deployPoolOnchain({
    managerWallet: wallet.address,
    name: parsed.data.name,
    slug,
    contributionAmount: parsed.data.contributionAmount,
    memberLimit: parsed.data.numberOfMembers,
    totalRounds: parsed.data.numberOfRounds,
    biddingEnabled: parsed.data.biddingEnabled,
    securityDeposit: parsed.data.securityDepositAmount,
    gracePenalty:
      (parsed.data.contributionAmount * parsed.data.penaltyPercentage) / 100,
    roundDurationHours: parsed.data.roundDuration,
    gracePeriodHours: parsed.data.gracePeriodDuration,
  })

  const pool = await PoolModel.create({
    slug,
    name: parsed.data.name,
    status: "Enrollment",
    category: parsed.data.biddingEnabled ? "Bidding" : "Non-Bidding",
    contributionAmount: parsed.data.contributionAmount,
    memberLimit: parsed.data.numberOfMembers,
    membersCount: 0,
    totalRounds: parsed.data.numberOfRounds,
    currentRound: 0,
    securityDeposit: parsed.data.securityDepositAmount,
    gracePeriodDurationHours: parsed.data.gracePeriodDuration,
    roundDurationHours: parsed.data.roundDuration,
    biddingEnabled: parsed.data.biddingEnabled,
    lowestBid: 0,
    settlementSummary: onchain.simulated
      ? "Created in app mode and queued for reviewer approval. Configure factory + operator key to deploy directly on Sepolia."
      : "Pool deployed through the Sepolia factory and queued for reviewer approval.",
    countdownAt: addHours(new Date(), parsed.data.roundDuration),
    chainId: 11155111,
    poolAddress: onchain.handlerAddress,
    vaultAddress: onchain.vaultAddress,
    tokenAddress: "",
    creatorUserId: session.user.id,
    creatorWallet: wallet.address,
    reviewStatus: "pending",
  })

  await UserProfileModel.updateOne(
    { authUserId: session.user.id },
    {
      $setOnInsert: {
        authUserId: session.user.id,
        email: session.user.email,
        username: session.user.name,
      },
    },
    { upsert: true }
  )

  return NextResponse.json({
    pool: {
      id: pool.slug,
      name: pool.name,
    },
  })
}
