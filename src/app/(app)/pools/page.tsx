import { FilterIcon, SearchIcon } from "lucide-react"

import { pools } from "@/lib/mock-data"
import { PageTransition } from "@/components/app/page-transition"
import { PoolCard } from "@/components/pool-card"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const filters = ["Bidding", "Non-Bidding", "Enrollment", "Active", "Completed"]

export default function PoolsPage() {
  return (
    <PageTransition>
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
            Pools Explorer
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Browse circles by cadence, risk, and payout style
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-[280px]">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search pool or mediator" className="pl-9" />
          </div>
          <Select defaultValue="newest">
            <SelectTrigger className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="value">Highest Value</SelectItem>
                <SelectItem value="risk">Lowest Risk</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <Card className="rounded-3xl border border-border/70 bg-card/95 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilterIcon className="size-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 xl:flex-col">
            {filters.map((filter) => (
              <Badge key={filter} variant="outline" className="rounded-full px-3 py-1">
                {filter}
              </Badge>
            ))}
          </CardContent>
        </Card>
        <div className="grid gap-4 xl:grid-cols-2">
          {pools.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      </section>
    </PageTransition>
  )
}
