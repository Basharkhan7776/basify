import { LayoutGridIcon } from "lucide-react"

import { getDashboardSnapshot } from "@/lib/app-data"
import { getAuthSession } from "@/lib/session"
import { PageTransition } from "@/components/app/page-transition"
import { PoolCard } from "@/components/pool-card"
import { StatsCard } from "@/components/stats-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabValues = [
  "All Pools",
  "Bidding Pools",
  "Non-Bidding Pools",
  "Earnable Pools",
  "Non-Earnable Pools",
]

export default async function DashboardPage() {
  const session = await getAuthSession()
  const { workspace, stats, pools } = await getDashboardSnapshot(session?.user?.id)

  return (
    <PageTransition>
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome back, {workspace?.username ?? "member"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            OAuth is active, wallet actions run on Sepolia, and the scheduler treats one month as one hour.
          </p>
        </div>
        <Card className="w-full max-w-sm rounded-2xl border border-border/70 bg-background/80 shadow-sm">
          <CardHeader>
            <CardDescription>Quick status</CardDescription>
            <CardTitle className="text-base">{workspace?.wallet ?? "Wallet not linked"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {workspace?.wallet
              ? "Connected. Reputation and auto-pay rating stay attached to your OAuth workspace."
              : "Link a primary wallet from /auth before sending onchain transactions."}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
          />
        ))}
      </section>

      <Tabs defaultValue="All Pools" className="gap-4">
        <TabsList className="flex w-full flex-wrap justify-start rounded-2xl bg-muted/60 p-1 h-auto">
          {tabValues.map((tab) => (
            <TabsTrigger key={tab} value={tab} className="rounded-xl px-3 py-2">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="All Pools" className="grid gap-4 xl:grid-cols-2">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </TabsContent>
        {tabValues.slice(1).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card className="rounded-2xl border border-border/70 bg-card/90 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGridIcon className="size-4" />
                  {tab}
                </CardTitle>
              <CardDescription>
                  Filtered pool views are seeded from Mongo-backed pool records.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 xl:grid-cols-2">
                {pools.slice(0, 2).map((pool) => (
                  <PoolCard key={`${tab}-${pool.id}`} pool={pool} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </PageTransition>
  )
}
