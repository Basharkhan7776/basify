import { NextResponse } from "next/server"
import { z } from "zod"

import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

const bodySchema = z.object({
  address: z.string().startsWith("0x"),
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

  const issuedAt = new Date().toISOString()
  const message = [
    "Basify wallet verification",
    `User: ${session.user.email}`,
    `Username: ${parsed.data.username}`,
    `Wallet: ${parsed.data.address}`,
    `Issued At: ${issuedAt}`,
    "Chain: Ethereum Sepolia (11155111)",
  ].join("\n")

  return NextResponse.json({ message })
}
