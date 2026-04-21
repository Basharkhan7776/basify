import { notFound } from "next/navigation"

import { getPoolById, pools, formatUsd } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function generateStaticParams() {
  return pools.map((pool) => ({ poolId: pool.id }))
}

export default async function JoinPoolPage({
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
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Join Pool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Confirm participation in {pool.name}
        </h1>
      </section>
      <Card className="max-w-2xl rounded-[32px] border border-border/70 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Pool summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Contribution amount</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatUsd(pool.contributionAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Members</p>
              <p className="mt-2 text-2xl font-semibold">
                {pool.membersCount}/{pool.memberLimit}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Remaining slots</p>
              <p className="mt-2 text-2xl font-semibold">{pool.remainingSlots}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Security deposit</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatUsd(pool.securityDeposit)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Approve</Button>
            <Button>Join Pool</Button>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
