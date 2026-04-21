"use client"

import { bidsByPool, formatUsd } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function BidPanel({ poolId }: { poolId: string }) {
  const bids = bidsByPool[poolId] ?? []

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Bid history</CardTitle>
          <CardDescription>Latest mock submissions for the active round.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {bids.map((bid) => (
            <div
              key={`${bid.member}-${bid.time}`}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/35 px-4 py-3"
            >
              <div>
                <p className="font-medium">{bid.member}</p>
                <p className="text-sm text-muted-foreground">{bid.time}</p>
              </div>
              <div className="text-sm font-medium">{formatUsd(bid.amount)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-2xl border border-border/70 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Place a bid</CardTitle>
          <CardDescription>Mock input only. No transaction is submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="bid-amount">Bid amount</FieldLabel>
              <FieldContent>
                <Input id="bid-amount" placeholder="Enter lowest bid" />
                <FieldDescription>
                  Lower bids improve payout priority for this round.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Button className="w-full">Submit Mock Bid</Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
