import { getPoolsData } from "@/lib/app-data"
import { formatUsd } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { CountdownTimer } from "@/components/countdown-timer"
import { StatsCard } from "@/components/stats-card"

export default async function ActivePoolPage() {
  const pools = await getPoolsData()
  const pool =
    pools.find((item) => item.status === "Bidding" || item.status === "Active") ?? pools[0]

  if (!pool) {
    return null
  }

  return (
    <PageTransition>
      <section className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Active Pool
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{pool.name}</h1>
        </div>
        <CountdownTimer value={pool.countdown} />
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Contribution Due"
          value={formatUsd(pool.contributionAmount)}
          detail="Due before grace period opens"
        />
        <StatsCard
          label="Next Payout Eligibility"
          value={pool.remainingSlots === 0 ? "Eligible" : "Pending"}
          detail="Based on your linked workspace status"
        />
        <StatsCard
          label="Bid Opportunity"
          value={pool.biddingEnabled ? "Open" : "Closed"}
          detail={
            pool.biddingEnabled
              ? `Lowest bid currently ${formatUsd(pool.lowestBid || 0)}`
              : "This circle settles without bidding"
          }
        />
        <StatsCard
          label="Round Status"
          value={pool.status}
          detail={pool.settlementSummary}
        />
      </div>
    </PageTransition>
  )
}
