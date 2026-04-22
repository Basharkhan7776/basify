import { NextResponse } from "next/server"

import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getAuthSession()
  return NextResponse.json({ session })
}
