import { notFound } from "next/navigation"

import { getPoolById, pools, membersByPool, formatUsd } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { MemberTable } from "@/components/member-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export async function generateStaticParams() {
  return pools.map((pool) => ({ poolId: pool.id }))
}

export default async function ManagePoolPage({
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
          Mediator Management
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Operational controls for {pool.name}
        </h1>
      </section>
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Security deposit status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
              <p className="text-sm text-muted-foreground">Locked collateral</p>
              <p className="mt-2 text-3xl font-semibold">
                {formatUsd(pool.securityDeposit)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/35 p-4 text-sm text-muted-foreground">
              Missing contributors: 2
            </div>
            <div className="grid gap-3">
              <Button variant="outline">Trigger Settlement</Button>
              <Button variant="outline">Pause Contribution Window</Button>
              <Button>Top Up Deposit</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Missing contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberTable members={membersByPool[pool.id] ?? []} compact />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
