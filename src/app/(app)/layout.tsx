import { redirect } from "next/navigation"

import { AppShell } from "@/components/app/app-shell"
import { getWorkspace, upsertWorkspaceFromSession } from "@/lib/app-data"
import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAuthSession()

  if (!session?.user) {
    redirect("/auth")
  }

  await upsertWorkspaceFromSession({
    authUserId: session.user.id,
    email: session.user.email,
    username: session.user.name,
    image: session.user.image,
    oauthProvider: "oauth",
  })

  const workspace = await getWorkspace(session.user.id)

  return <AppShell workspace={workspace}>{children}</AppShell>
}
