import Link from "next/link"

import { PageTransition } from "@/components/app/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function CreatePoolPage() {
  return (
    <PageTransition>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Create Pool
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Configure a new rotating liquidity pool
        </h1>
      </section>

      <Card className="rounded-[32px] border border-border/70 bg-card/95 shadow-sm">
        <CardHeader>
          <CardTitle>Pool configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6 lg:grid-cols-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="pool-name">Pool Name</FieldLabel>
                <FieldContent>
                  <Input id="pool-name" placeholder="Atlas Growth Circle" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="contribution">Contribution Amount</FieldLabel>
                <FieldContent>
                  <Input id="contribution" placeholder="$250" aria-invalid />
                  <FieldDescription>
                    Validation state placeholder for required numeric input.
                  </FieldDescription>
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="members">Number of Members</FieldLabel>
                <FieldContent>
                  <Input id="members" placeholder="12" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="rounds">Number of Rounds</FieldLabel>
                <FieldContent>
                  <Input id="rounds" placeholder="12" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="round-duration">Round Duration</FieldLabel>
                <FieldContent>
                  <Select defaultValue="30-days">
                    <SelectTrigger id="round-duration" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="30-days">30 days</SelectItem>
                        <SelectItem value="14-days">14 days</SelectItem>
                        <SelectItem value="7-days">7 days</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="bidding-enabled">Bidding Enabled</FieldLabel>
                <Switch id="bidding-enabled" defaultChecked />
              </Field>
              <Field>
                <FieldLabel htmlFor="deposit">Security Deposit Amount</FieldLabel>
                <FieldContent>
                  <Input id="deposit" placeholder="$3,000" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="grace-period">Grace Period Duration</FieldLabel>
                <FieldContent>
                  <Input id="grace-period" placeholder="72 hours" />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="penalty">Penalty Percentage</FieldLabel>
                <FieldContent>
                  <Input id="penalty" placeholder="4%" />
                </FieldContent>
              </Field>
            </FieldGroup>

            <div className="lg:col-span-2 flex flex-wrap gap-3">
              <Button>Create Pool</Button>
              <Button variant="outline" render={<Link href="/pools" />}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageTransition>
  )
}
