"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

export function CreatePoolForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [name, setName] = useState("")
  const [contributionAmount, setContributionAmount] = useState("250")
  const [members, setMembers] = useState("12")
  const [rounds, setRounds] = useState("12")
  const [roundDuration, setRoundDuration] = useState("1")
  const [biddingEnabled, setBiddingEnabled] = useState(true)
  const [deposit, setDeposit] = useState("3000")
  const [gracePeriod, setGracePeriod] = useState("1")
  const [penalty, setPenalty] = useState("4")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    const response = await fetch("/api/pools", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        contributionAmount,
        numberOfMembers: members,
        numberOfRounds: rounds,
        roundDuration,
        biddingEnabled,
        securityDepositAmount: deposit,
        gracePeriodDuration: gracePeriod,
        penaltyPercentage: penalty,
      }),
    })

    const data = await response.json()
    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMessage(data.error ?? "Pool creation failed.")
      return
    }

    router.push(`/pools/${data.pool.id}`)
    router.refresh()
  }

  return (
    <Card className="rounded-[32px] border border-border/70 bg-card/95 shadow-sm">
      <CardHeader>
        <CardTitle>Pool configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6 lg:grid-cols-2" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="pool-name">Pool Name</FieldLabel>
              <FieldContent>
                <Input
                  id="pool-name"
                  placeholder="Atlas Growth Circle"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="contribution">Contribution Amount</FieldLabel>
              <FieldContent>
                <Input
                  id="contribution"
                  placeholder="$250"
                  value={contributionAmount}
                  onChange={(event) => setContributionAmount(event.target.value)}
                  required
                />
                <FieldDescription>
                  All numeric inputs map directly into the app scheduler and optional factory deployment call.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="members">Number of Members</FieldLabel>
              <FieldContent>
                <Input
                  id="members"
                  placeholder="12"
                  value={members}
                  onChange={(event) => setMembers(event.target.value)}
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="rounds">Number of Rounds</FieldLabel>
              <FieldContent>
                <Input
                  id="rounds"
                  placeholder="12"
                  value={rounds}
                  onChange={(event) => setRounds(event.target.value)}
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="round-duration">Round Duration</FieldLabel>
              <FieldContent>
                <Select
                  value={roundDuration}
                  onValueChange={(value) => setRoundDuration(value ?? "1")}
                >
                  <SelectTrigger id="round-duration" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="1">1 hour (simulated month)</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="bidding-enabled">Bidding Enabled</FieldLabel>
              <Switch
                id="bidding-enabled"
                checked={biddingEnabled}
                onCheckedChange={setBiddingEnabled}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="deposit">Security Deposit Amount</FieldLabel>
              <FieldContent>
                <Input
                  id="deposit"
                  placeholder="$3,000"
                  value={deposit}
                  onChange={(event) => setDeposit(event.target.value)}
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="grace-period">Grace Period Duration</FieldLabel>
              <FieldContent>
                <Input
                  id="grace-period"
                  placeholder="1"
                  value={gracePeriod}
                  onChange={(event) => setGracePeriod(event.target.value)}
                  required
                />
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="penalty">Penalty Percentage</FieldLabel>
              <FieldContent>
                <Input
                  id="penalty"
                  placeholder="4"
                  value={penalty}
                  onChange={(event) => setPenalty(event.target.value)}
                  required
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          {errorMessage ? (
            <p className="lg:col-span-2 rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 lg:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Pool..." : "Create Pool"}
            </Button>
            <Button variant="outline" type="button" onClick={() => router.push("/pools")}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
