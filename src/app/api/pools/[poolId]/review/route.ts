import { NextResponse } from "next/server"
import { z } from "zod"

import { hasRole } from "@/lib/access"
import { connectToDatabase } from "@/lib/mongoose"
import { PoolModel } from "@/lib/db/models/pool"
import { UserProfileModel } from "@/lib/db/models/user-profile"
import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  decision: z.enum(["approved", "rejected"]),
})

export async function POST(
  request: Request,
  context: { params: Promise<{ poolId: string }> }
) {
  const session = await getAuthSession()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()

  const reviewer = await UserProfileModel.findOne({
    authUserId: session.user.id,
  }).lean()

  if (!hasRole(reviewer?.roles, "reviewer")) {
    return NextResponse.json({ error: "Reviewer role required." }, { status: 403 })
  }

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const { poolId } = await context.params
  const pool = await PoolModel.findOne({ slug: poolId })

  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 })
  }

  pool.reviewStatus = parsed.data.decision
  pool.reviewedByUserId = session.user.id
  pool.reviewedAt = new Date()
  pool.settlementSummary =
    parsed.data.decision === "approved"
      ? "Reviewer approved this pool. Enrollment can proceed toward activation."
      : "Reviewer rejected this pool. Pool maker updates are required."

  await pool.save()

  return NextResponse.json({ ok: true, reviewStatus: pool.reviewStatus })
}
