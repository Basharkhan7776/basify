import { getWorkspace } from "@/lib/app-data"
import { contributionTimeline, userProfile } from "@/lib/mock-data"
import { getAuthSession } from "@/lib/session"
import { PageTransition } from "@/components/app/page-transition"
import { ReputationBadge } from "@/components/reputation-badge"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const session = await getAuthSession()
  const workspace = await getWorkspace(session?.user?.id)

  return (
    <PageTransition>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Profile
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Member identity and performance
        </h1>
      </section>
      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>{workspace?.username ?? userProfile.username}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="mt-2 font-mono text-sm">
                {workspace?.wallet ?? "Primary wallet not linked"}
              </p>
            </div>
            <ReputationBadge score={workspace?.reputation ?? userProfile.reputation} />
            <div className="grid gap-4 sm:grid-cols-2">
              <StatsCard
                label="Total Earnings"
                value={`$${(workspace?.totalEarnings ?? userProfile.totalEarnings).toLocaleString()}`}
                detail="Across completed and active pools"
              />
              <StatsCard
                label="Pools Joined"
                value={`${workspace?.poolsJoined ?? userProfile.poolsJoined}`}
                detail={`OAuth provider: ${workspace?.oauthProvider ?? "seed"}`}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Contribution timeline</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {contributionTimeline.map((item) => (
              <div
                key={`${item.title}-${item.date}`}
                className="rounded-2xl border border-border/60 bg-muted/35 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.title}</p>
                  <span className="text-sm text-muted-foreground">{item.date}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
