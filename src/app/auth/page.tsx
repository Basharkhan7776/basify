import { getWorkspace } from "@/lib/app-data"
import { AuthScreen } from "@/components/auth/auth-screen"
import { isOAuthProviderEnabled } from "@/lib/env"
import { getAuthSession } from "@/lib/session"

export const dynamic = "force-dynamic"

export default async function AuthPage() {
  const session = await getAuthSession()
  const workspace = await getWorkspace(session?.user?.id)

  return (
    <AuthScreen
      initialUsername={workspace?.username ?? session?.user?.name ?? "basify.member"}
      walletPreview={workspace?.wallet ?? "0x72beC71F...B013"}
      isGoogleEnabled={isOAuthProviderEnabled("google")}
      isGithubEnabled={isOAuthProviderEnabled("github")}
      isSignedIn={Boolean(session?.user)}
    />
  )
}
