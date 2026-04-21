import { getPoolById } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { CountdownTimer } from "@/components/countdown-timer"
import { StatsCard } from "@/components/stats-card"

export default function ActivePoolPage() {
  const pool = getPoolById("atlas-growth")

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
          value="$250"
          detail="Due before grace period opens"
        />
        <StatsCard
          label="Next Payout Eligibility"
          value="Eligible"
          detail="Strong reputation and active status"
        />
        <StatsCard
          label="Bid Opportunity"
          value="Open"
          detail="Lowest bid currently $62"
        />
        <StatsCard
          label="Round Status"
          value="Awaiting"
          detail="Two member payments still pending"
        />
      </div>
    </PageTransition>
  )
}
