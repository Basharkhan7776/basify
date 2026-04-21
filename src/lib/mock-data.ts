import {
  BellRingIcon,
  CircleDollarSignIcon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserCircle2Icon,
  WalletCardsIcon,
} from "lucide-react"

export type PoolStatus =
  | "Enrollment"
  | "Active"
  | "Bidding"
  | "Paused"
  | "Completed"

export type PoolCategory =
  | "Bidding"
  | "Non-Bidding"
  | "Earnable"
  | "Non-Earnable"

export type Pool = {
  id: string
  name: string
  contributionAmount: number
  membersCount: number
  memberLimit: number
  currentRound: number
  totalRounds: number
  status: PoolStatus
  lowestBid: number
  countdown: string
  securityDeposit: number
  remainingSlots: number
  biddingEnabled: boolean
  category: PoolCategory
  valueLocked: number
  completion: number
  settlementSummary: string
}

export type Member = {
  name: string
  wallet: string
  reputation: number
  contributionStatus: string
  roundsReceived: number
}

export type RoundSummary = {
  round: number
  winner: string
  contributionStatus: string
  settlementStatus: string
}

export type Transaction = {
  type: string
  amount: number
  status: string
  date: string
}

export type Bid = {
  member: string
  amount: number
  time: string
}

export type Activity = {
  title: string
  detail: string
  date: string
}

export type AppNavItem = {
  href: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export const appNavItems: AppNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/pools", label: "Pools", icon: FolderKanbanIcon },
  { href: "/pools/create", label: "Create Pool", icon: CircleDollarSignIcon },
  { href: "/my-pools", label: "My Pools", icon: BellRingIcon },
  { href: "/active-pool", label: "Active Pool", icon: WalletCardsIcon },
  { href: "/profile", label: "Profile", icon: UserCircle2Icon },
  { href: "/settings", label: "Settings", icon: SlidersHorizontalIcon },
  { href: "/admin", label: "Admin", icon: ShieldCheckIcon },
]

export const protocolStats = [
  { label: "Total Pools", value: "128", change: "+12 this month" },
  { label: "Total Members", value: "4,920", change: "+311 verified" },
  { label: "Total Value Locked", value: "$8.4M", change: "+9.2% quarter" },
]

export const dashboardStats = [
  { label: "Active Pools", value: "06", detail: "2 bidding windows open" },
  {
    label: "Pending Contributions",
    value: "$1,250",
    detail: "Next due in 18 hours",
  },
  { label: "Total Earnings", value: "$14,820", detail: "Across 11 cycles" },
  { label: "Reputation Score", value: "92", detail: "Top 8% members" },
]

export const adminStats = [
  { label: "Total Users", value: "12,480", detail: "1,208 verified this week" },
  { label: "Total Pools", value: "384", detail: "29 created in the last 30 days" },
  { label: "Total Value Locked", value: "$22.6M", detail: "Across all chains" },
  { label: "Active Rounds", value: "93", detail: "17 settlements due today" },
]

export const chartBars = [
  { label: "Jan", height: 42 },
  { label: "Feb", height: 58 },
  { label: "Mar", height: 72 },
  { label: "Apr", height: 66 },
  { label: "May", height: 80 },
  { label: "Jun", height: 92 },
]

export const revenuePoints = [24, 38, 30, 54, 48, 72, 68]

export const pools: Pool[] = [
  {
    id: "atlas-growth",
    name: "Atlas Growth Circle",
    contributionAmount: 250,
    membersCount: 10,
    memberLimit: 12,
    currentRound: 4,
    totalRounds: 12,
    status: "Bidding",
    lowestBid: 62,
    countdown: "18h 24m",
    securityDeposit: 3000,
    remainingSlots: 2,
    biddingEnabled: true,
    category: "Bidding",
    valueLocked: 30000,
    completion: 67,
    settlementSummary: "2 missing contributions covered by grace period.",
  },
  {
    id: "harbor-yield",
    name: "Harbor Yield Pool",
    contributionAmount: 400,
    membersCount: 8,
    memberLimit: 8,
    currentRound: 6,
    totalRounds: 8,
    status: "Active",
    lowestBid: 0,
    countdown: "3d 08h",
    securityDeposit: 4200,
    remainingSlots: 0,
    biddingEnabled: false,
    category: "Non-Bidding",
    valueLocked: 25600,
    completion: 82,
    settlementSummary: "All contributions received ahead of settlement.",
  },
  {
    id: "north-star",
    name: "North Star Syndicate",
    contributionAmount: 150,
    membersCount: 14,
    memberLimit: 16,
    currentRound: 2,
    totalRounds: 16,
    status: "Enrollment",
    lowestBid: 44,
    countdown: "1d 12h",
    securityDeposit: 2400,
    remainingSlots: 2,
    biddingEnabled: true,
    category: "Earnable",
    valueLocked: 33600,
    completion: 21,
    settlementSummary: "Enrollment closes after the final two seats are filled.",
  },
  {
    id: "summit-stability",
    name: "Summit Stability Pool",
    contributionAmount: 320,
    membersCount: 12,
    memberLimit: 12,
    currentRound: 12,
    totalRounds: 12,
    status: "Completed",
    lowestBid: 0,
    countdown: "Settled",
    securityDeposit: 3800,
    remainingSlots: 0,
    biddingEnabled: false,
    category: "Non-Earnable",
    valueLocked: 46080,
    completion: 100,
    settlementSummary: "Cycle completed and security deposit released.",
  },
]

export const membersByPool: Record<string, Member[]> = {
  "atlas-growth": [
    {
      name: "Avery Khan",
      wallet: "0x72be...b013",
      reputation: 96,
      contributionStatus: "Paid",
      roundsReceived: 1,
    },
    {
      name: "Mina Patel",
      wallet: "0x44ad...c9ef",
      reputation: 91,
      contributionStatus: "Grace Period",
      roundsReceived: 0,
    },
    {
      name: "Jon Vega",
      wallet: "0x12ca...38fd",
      reputation: 84,
      contributionStatus: "Paid",
      roundsReceived: 0,
    },
    {
      name: "Sora Chen",
      wallet: "0xa18b...d920",
      reputation: 88,
      contributionStatus: "Paid",
      roundsReceived: 1,
    },
  ],
  "harbor-yield": [
    {
      name: "Iman Cole",
      wallet: "0x64fd...4d44",
      reputation: 94,
      contributionStatus: "Paid",
      roundsReceived: 1,
    },
    {
      name: "Rhea Noor",
      wallet: "0x900d...bb91",
      reputation: 90,
      contributionStatus: "Paid",
      roundsReceived: 0,
    },
  ],
}

export const roundsByPool: Record<string, RoundSummary[]> = {
  "atlas-growth": [
    {
      round: 1,
      winner: "Avery Khan",
      contributionStatus: "Complete",
      settlementStatus: "Settled",
    },
    {
      round: 2,
      winner: "Sora Chen",
      contributionStatus: "Complete",
      settlementStatus: "Settled",
    },
    {
      round: 3,
      winner: "Pending Bid Winner",
      contributionStatus: "Grace Period",
      settlementStatus: "Awaiting",
    },
  ],
}

export const transactionsByPool: Record<string, Transaction[]> = {
  "atlas-growth": [
    {
      type: "Contribution",
      amount: 250,
      status: "Confirmed",
      date: "Apr 20, 2026",
    },
    {
      type: "Bid Lock",
      amount: 62,
      status: "Pending",
      date: "Apr 20, 2026",
    },
    {
      type: "Security Top-Up",
      amount: 500,
      status: "Confirmed",
      date: "Apr 17, 2026",
    },
  ],
}

export const bidsByPool: Record<string, Bid[]> = {
  "atlas-growth": [
    { member: "Avery Khan", amount: 84, time: "12:48 UTC" },
    { member: "Jon Vega", amount: 72, time: "13:09 UTC" },
    { member: "Mina Patel", amount: 62, time: "13:34 UTC" },
  ],
}

export const userProfile = {
  username: "bashar.eth",
  wallet: "0x72beC71F...B013",
  reputation: 92,
  totalEarnings: 14820,
  poolsJoined: 11,
  activePool: "Atlas Growth Circle",
}

export const contributionTimeline: Activity[] = [
  {
    title: "Round 4 contribution submitted",
    detail: "Atlas Growth Circle",
    date: "Today",
  },
  {
    title: "Eligible for next payout",
    detail: "Harbor Yield Pool",
    date: "Yesterday",
  },
  {
    title: "Reputation increased to 92",
    detail: "Timely contributions streak: 6",
    date: "Apr 16",
  },
]

export const recentPools = [
  { name: "Delta Reserve", manager: "rhea.eth", members: 8, status: "Active" },
  {
    name: "Cedar Network",
    manager: "iman.eth",
    members: 12,
    status: "Enrollment",
  },
  {
    name: "Pioneer Cycle",
    manager: "avery.eth",
    members: 10,
    status: "Completed",
  },
]

export const recentUsers = [
  { name: "Rhea Noor", wallet: "0x900d...bb91", joined: "Apr 20" },
  { name: "Iman Cole", wallet: "0x64fd...4d44", joined: "Apr 19" },
  { name: "Nadia Ross", wallet: "0xee20...cc48", joined: "Apr 18" },
]

export function getPoolById(poolId: string) {
  return pools.find((pool) => pool.id === poolId)
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}
