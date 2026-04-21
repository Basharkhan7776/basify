import { BellIcon, ChevronDownIcon, Wallet2Icon } from "lucide-react"

import { userProfile } from "@/lib/mock-data"
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

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 rounded-[28px] border border-border/70 bg-background/85 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <div className="lg:hidden">
          <span className="sr-only">Navigation controls appear beside this header.</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-muted-foreground">Wallet Status</p>
          <p className="truncate font-medium">Connected to Base Sepolia</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="hidden rounded-full px-3 py-1 sm:inline-flex">
          <Wallet2Icon data-icon="inline-start" />
          {userProfile.wallet}
        </Badge>
        <ThemeToggle />
        <Button variant="outline" size="icon-sm" aria-label="Notifications">
          <BellIcon />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="outline" className="rounded-full px-2.5" />}
          >
            <Avatar className="size-7">
              <AvatarFallback>BK</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{userProfile.username}</span>
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
              <DropdownMenuItem>Disconnect</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
