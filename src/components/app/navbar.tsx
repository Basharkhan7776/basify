"use client"

import { BellIcon, ChevronDownIcon, Wallet2Icon } from "lucide-react"
import { useRouter } from "next/navigation"

import type { UserWorkspace } from "@/lib/app-types"
import { authClient } from "@/lib/auth-client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { WalletStatusChip } from "@/components/wallet/wallet-status-chip"

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function Navbar({ workspace }: { workspace: UserWorkspace | null }) {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/auth")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 rounded-[28px] border border-border/70 bg-background/85 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <div className="lg:hidden">
          <span className="sr-only">Navigation controls appear beside this header.</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">Wallet Status</p>
          <p className="truncate font-medium">Connected to Ethereum Sepolia</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden rounded-full px-3 py-1 sm:inline-flex">
          <Wallet2Icon data-icon="inline-start" />
          1 month = 1 hour
        </Badge>
        <WalletStatusChip fallback={workspace?.wallet ?? null} />
        <ThemeToggle />
        <Button variant="outline" size="icon-sm" aria-label="Notifications">
          <BellIcon />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" className="rounded-full px-2.5" />}
          >
            <Avatar className="size-7">
              <AvatarFallback>{initials(workspace?.username ?? "BA")}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{workspace?.username ?? "Account"}</span>
            <ChevronDownIcon data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Wallet Preferences</DropdownMenuItem>
              <DropdownMenuItem>Notifications</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
