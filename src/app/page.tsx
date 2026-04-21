"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRightIcon,
  CircleDollarSignIcon,
  HandCoinsIcon,
  WalletCardsIcon,
  WavesIcon,
} from "lucide-react"

import { protocolStats } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const steps = [
  {
    title: "Join pool",
    description: "Review rules, lock your seat, and enter with transparent collateral terms.",
    icon: WalletCardsIcon,
  },
  {
    title: "Contribute monthly",
    description: "Meet contribution windows with grace periods, status tracking, and settlement continuity.",
    icon: CircleDollarSignIcon,
  },
  {
    title: "Bid or wait",
    description: "Choose bidding-enabled circles for earlier liquidity or stay in deterministic rotation.",
    icon: HandCoinsIcon,
  },
  {
    title: "Receive payout",
    description: "Smart-contract driven disbursement closes each round with auditable settlement records.",
    icon: WavesIcon,
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-4 md:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_26%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-[30px] border border-border/70 bg-background/80 px-5 py-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-foreground text-background">
              B
            </div>
            <div>
              <p className="font-medium">Basify Protocol</p>
              <p className="text-sm text-muted-foreground">
                Decentralized rotating liquidity infrastructure
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" render={<Link href="/auth" />}>
              Sign in
            </Button>
            <Button render={<Link href="/dashboard" />}>Connect Wallet</Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[34px] border border-border/70 bg-card/90 p-8 shadow-sm md:p-10">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm uppercase tracking-[0.28em] text-muted-foreground">
                Rotating savings, rebuilt for programmable trust
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Predictable liquidity for communities that move together.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
                Basify turns ROSCA-style capital coordination into a clean onchain
                system with bidding, collateralized continuity, and reputation-aware
                participation.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" render={<Link href="/dashboard" />}>
                  Connect Wallet
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/pools" />}>
                  Explore Pools
                </Button>
              </div>
            </div>
          </div>
          <Card className="rounded-[34px] border border-border/70 bg-card/90 shadow-sm">
            <CardHeader>
              <CardDescription>Protocol snapshot</CardDescription>
              <CardTitle className="text-2xl">Designed like infrastructure</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {protocolStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border/60 bg-muted/35 p-4"
                >
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.change}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <Card className="h-full rounded-[28px] border border-border/70 bg-card/90 shadow-sm">
                  <CardHeader>
                    <div className="flex size-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/35">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle className="mt-4">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </section>

        <section className="rounded-[34px] border border-border/70 bg-card/90 p-8 shadow-sm md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Ready to model your next pool?
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Launch a mock circle or review active pools.
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" render={<Link href="/pools" />}>
                Explore Pools
              </Button>
              <Button render={<Link href="/pools/create" />}>Create Pool</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
