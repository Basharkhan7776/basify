import Link from "next/link"
import {
  ArrowUpRightIcon,
  CoinsIcon,
  GaugeCircleIcon,
  UsersIcon,
} from "lucide-react"

import { Pool, formatUsd } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CountdownTimer } from "@/components/countdown-timer"

export function PoolCard({
  pool,
  showManage = true,
}: {
  pool: Pool
  showManage?: boolean
}) {
  return (
    <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm transition-transform duration-200 hover:-translate-y-1">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>{pool.name}</CardTitle>
            <CardDescription>
              {formatUsd(pool.contributionAmount)} per round
            </CardDescription>
          </div>
          <Badge variant={pool.status === "Completed" ? "secondary" : "outline"}>
            {pool.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/35 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Members
            </p>
            <p className="mt-2 flex items-center gap-2 font-medium">
              <UsersIcon className="size-4 text-muted-foreground" />
              {pool.membersCount}/{pool.memberLimit}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/35 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Current Round
            </p>
            <p className="mt-2 flex items-center gap-2 font-medium">
              <GaugeCircleIcon className="size-4 text-muted-foreground" />
              {pool.currentRound} of {pool.totalRounds}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/60 bg-background/80 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Lowest Bid
            </p>
            <p className="mt-1 flex items-center gap-2 font-medium">
              <CoinsIcon className="size-4 text-muted-foreground" />
              {pool.lowestBid ? formatUsd(pool.lowestBid) : "No bids yet"}
            </p>
          </div>
          <CountdownTimer value={pool.countdown} />
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-2 bg-transparent">
        <Button render={<Link href={`/pools/${pool.id}`} />}>
          <ArrowUpRightIcon data-icon="inline-start" />
          View
        </Button>
        <Button variant="outline" render={<Link href={`/pools/${pool.id}/join`} />}>
          Join
        </Button>
        {showManage ? (
          <Button
            variant="outline"
            render={<Link href={`/pools/${pool.id}/manage`} />}
          >
            Manage
          </Button>
        ) : (
          <Button
            variant="outline"
            render={<Link href={`/pools/${pool.id}/round`} />}
          >
            Round
          </Button>
        )}
        <Button variant="secondary" render={<Link href={`/pools/${pool.id}`} />}>
          {pool.biddingEnabled ? "Bid" : "Contribute"}
        </Button>
      </CardFooter>
    </Card>
  )
}
