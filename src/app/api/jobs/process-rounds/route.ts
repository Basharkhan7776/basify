import { NextResponse } from "next/server"

import { env } from "@/lib/env"
import { processDueRounds } from "@/lib/pool-engine"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${env.schedulerSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await processDueRounds()
  return NextResponse.json(result)
}
