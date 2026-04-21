import { LayoutGridIcon } from "lucide-react"

import { dashboardStats, pools } from "@/lib/mock-data"
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

export default function DashboardPage() {
  return (
    <PageTransition>
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome back, Bashar
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your wallet is connected and two pool decisions are waiting this round.
          </p>
        </div>
        <Card className="w-full max-w-sm rounded-2xl border border-border/70 bg-background/80 shadow-sm">
          <CardHeader>
            <CardDescription>Quick status</CardDescription>
            <CardTitle className="text-base">0x72beC71F...B013</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Connected. Reputation preserved across your active circles.
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
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
                  Mock grouping view. Navigation remains available through each card.
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
