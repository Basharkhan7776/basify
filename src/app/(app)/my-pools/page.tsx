import { pools } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { EmptyState } from "@/components/empty-state"
import { PoolCard } from "@/components/pool-card"

export default function MyPoolsPage() {
  const joinedPools = pools.slice(0, 3)

  return (
    <PageTransition>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          My Pools
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          All circles you currently monitor or contribute to
        </h1>
      </section>
      {joinedPools.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {joinedPools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} showManage={false} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No pools joined yet"
          description="Your joined pools will appear here once you approve a participation seat."
        />
      )}
    </PageTransition>
  )
}
