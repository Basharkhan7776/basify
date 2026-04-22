import { NextResponse } from "next/server"
import { verifyMessage } from "viem"
import { z } from "zod"

import { connectToDatabase } from "@/lib/mongoose"
import { UserProfileModel } from "@/lib/db/models/user-profile"
import { WalletLinkModel } from "@/lib/db/models/wallet-link"
import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  address: z.string().startsWith("0x"),
  message: z.string().min(10),
  signature: z.string().startsWith("0x"),
  username: z.string().min(2).max(40),
})

export async function POST(request: Request) {
  const session = await getAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const verified = await verifyMessage({
    address: parsed.data.address as `0x${string}`,
    message: parsed.data.message,
    signature: parsed.data.signature as `0x${string}`,
  })

  if (!verified) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 400 })
  }

  await connectToDatabase()

  const existingByWallet = await WalletLinkModel.findOne({
    address: parsed.data.address.toLowerCase(),
    authUserId: { $ne: session.user.id },
  }).lean()

  if (existingByWallet) {
    return NextResponse.json(
      { error: "Wallet already registered to another OAuth account." },
      { status: 409 }
    )
  }

  await WalletLinkModel.updateMany(
    { authUserId: session.user.id },
    { isPrimary: false }
  )

  await WalletLinkModel.findOneAndUpdate(
    { authUserId: session.user.id, address: parsed.data.address.toLowerCase() },
    {
      authUserId: session.user.id,
      address: parsed.data.address.toLowerCase(),
      chainId: 11155111,
      isPrimary: true,
      verifiedAt: new Date(),
      lastSignedMessage: parsed.data.message,
    },
    { upsert: true, new: true }
  )

  await UserProfileModel.findOneAndUpdate(
    { authUserId: session.user.id },
    {
      authUserId: session.user.id,
      email: session.user.email,
      username: parsed.data.username,
      image: session.user.image ?? "",
      primaryWalletAddress: parsed.data.address.toLowerCase(),
    },
    { upsert: true, new: true }
  )

  return NextResponse.json({ ok: true })
}
