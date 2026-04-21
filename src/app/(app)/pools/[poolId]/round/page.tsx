import { notFound } from "next/navigation"

import { getPoolById, pools, formatUsd } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { CountdownTimer } from "@/components/countdown-timer"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export async function generateStaticParams() {
  return pools.map((pool) => ({ poolId: pool.id }))
}

export default async function PoolRoundPage({
  params,
}: {
  params: Promise<{ poolId: string }>
}) {
  const { poolId } = await params
  const pool = getPoolById(poolId)

  if (!pool) {
    notFound()
  }

  return (
    <PageTransition>
      <section className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Round View
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {pool.name} · Round {pool.currentRound}
          </h1>
        </div>
        <CountdownTimer value={pool.countdown} />
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Contribution Due"
          value={formatUsd(pool.contributionAmount)}
          detail="Primary window closes in 18 hours"
        />
        <StatsCard
          label="Current Lowest Bid"
          value={formatUsd(pool.lowestBid || 0)}
          detail="Three bids submitted"
        />
        <StatsCard
          label="Eligible Members"
          value={`${pool.membersCount}`}
          detail="All seats in good standing"
        />
        <StatsCard
          label="Round Status"
          value={pool.status}
          detail="Settlement awaits final confirmations"
        />
      </div>

      <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Settlement progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress value={78} />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Contribution status</p>
              <p className="mt-2 font-medium">10/12 confirmed</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Winner candidate</p>
              <p className="mt-2 font-medium">Mina Patel</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Payout estimate</p>
              <p className="mt-2 font-medium">{formatUsd(pool.contributionAmount * pool.membersCount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
