import { chartBars, revenuePoints } from "@/lib/mock-data"
import { getAdminSnapshot } from "@/lib/app-data"
import { PageTransition } from "@/components/app/page-transition"
import { StatsCard } from "@/components/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default async function AdminPage() {
  const admin = await getAdminSnapshot()
  const revenuePath = revenuePoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${index * 48} ${90 - point}`)
    .join(" ")

  return (
    <PageTransition>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Network analytics and protocol oversight
        </h1>
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {admin.stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            detail={stat.detail}
          />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Pools Over Time</CardTitle>
          </CardHeader>
          <CardContent className="flex h-72 items-end gap-3">
            {chartBars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="w-full rounded-t-3xl bg-foreground/80" style={{ height: `${bar.height * 2}px` }} />
                <span className="text-sm text-muted-foreground">{bar.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <svg viewBox="0 0 300 120" className="h-72 w-full">
              <path
                d={revenuePath}
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d={`${revenuePath} L 288 120 L 0 120 Z`}
                fill="currentColor"
                className="opacity-10"
              />
            </svg>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Pools</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admin.recentPools.map((pool) => (
                  <TableRow key={pool.name}>
                    <TableCell className="font-medium">{pool.name}</TableCell>
                    <TableCell>{pool.round}</TableCell>
                    <TableCell>{pool.members}</TableCell>
                    <TableCell>{pool.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admin.recentUsers.map((user) => (
                  <TableRow key={`${user.email}-${user.name}`}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>{new Date(user.joined).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
