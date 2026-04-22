import { notFound } from "next/navigation"

import { getPoolDetails } from "@/lib/app-data"
import { formatUsd } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { BidPanel } from "@/components/bid-panel"
import { CountdownTimer } from "@/components/countdown-timer"
import { MemberTable } from "@/components/member-table"
import { StatsCard } from "@/components/stats-card"
import { TransactionTable } from "@/components/transaction-table"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function PoolDetailsPage({
  params,
}: {
  params: Promise<{ poolId: string }>
}) {
  const { poolId } = await params
  const data = await getPoolDetails(poolId)

  if (!data) {
    notFound()
  }

  const { pool, members, rounds, transactions } = data

  return (
    <PageTransition>
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Pool Details
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{pool.name}</h1>
          <p className="mt-2 text-muted-foreground">{pool.settlementSummary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CountdownTimer value={pool.countdown} />
          <Button variant="outline">Share Pool</Button>
        </div>
      </section>

      <Tabs defaultValue="overview" className="gap-4">
        <TabsList className="flex w-full flex-wrap justify-start rounded-2xl bg-muted/60 p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="rounds">Rounds</TabsTrigger>
          <TabsTrigger value="bidding">Bidding</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Contribution Amount"
              value={formatUsd(pool.contributionAmount)}
              detail={`${pool.membersCount} active members`}
            />
            <StatsCard
              label="Value Locked"
              value={formatUsd(pool.valueLocked)}
              detail={`${pool.totalRounds} total rounds`}
            />
            <StatsCard
              label="Security Deposit"
              value={formatUsd(pool.securityDeposit)}
              detail="Collateralized by mediator"
            />
            <StatsCard
              label="Current Round"
              value={`${pool.currentRound}`}
              detail={`Status: ${pool.status}`}
            />
          </div>
          <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Contribution progress</CardTitle>
              <CardDescription>
                Pool completion is modeled from Mongo round records and scheduler progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Progress value={pool.completion} />
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>{pool.completion}% settled</span>
                <span>{pool.settlementSummary}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <MemberTable members={members} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rounds">
          <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Rounds timeline</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {rounds.map((round) => (
                <div
                  key={round.round}
                  className="grid gap-2 rounded-2xl border border-border/60 bg-muted/35 px-4 py-4 md:grid-cols-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Round Number
                    </p>
                    <p className="mt-2 font-medium">{round.round}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Winner
                    </p>
                    <p className="mt-2 font-medium">{round.winner}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Contribution Status
                    </p>
                    <p className="mt-2">{round.contributionStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Settlement Status
                    </p>
                    <p className="mt-2">{round.settlementStatus}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bidding" className="flex flex-col gap-4">
          <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Current lowest bid</CardTitle>
              <CardDescription>
                Countdown is derived from the round window tracked in the app backend.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-3xl font-semibold">{formatUsd(pool.lowestBid || 0)}</p>
                <p className="text-sm text-muted-foreground">Lowest eligible bid this round</p>
              </div>
              <CountdownTimer value={pool.countdown} />
            </CardContent>
          </Card>
          <BidPanel poolId={pool.id} />
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionTable transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Mediator controls</CardTitle>
              <CardDescription>
                These controls map to the mediator/operator workflow and scheduled settlement engine.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {[
                "Pause Pool",
                "Resume Pool",
                "Trigger Settlement",
                "Close Pool",
                "Withdraw Deposit",
              ].map((action) => (
                <Button key={action} variant="outline" className="w-full">
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTransition>
  )
}
