"use client"

import Link from "next/link"
import { MenuIcon, PlusCircleIcon } from "lucide-react"
import { usePathname } from "next/navigation"

import { appNavItems } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col gap-6 rounded-[28px] border border-border/70 bg-card/90 p-4 shadow-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-3 py-3">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-foreground text-background">
          B
        </div>
        <div>
          <p className="font-medium">Basify</p>
          <p className="text-sm text-muted-foreground">Rotating liquidity protocol</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {appNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/pools" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-foreground text-background hover:bg-foreground hover:text-background"
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
        <p className="text-sm font-medium">Need a fresh circle?</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Launch a new pool with bidding and collateral settings.
        </p>
        <Button
          className="mt-4 w-full"
          variant="secondary"
          render={<Link href="/pools/create" />}
        >
          <PlusCircleIcon data-icon="inline-start" />
          Create Pool
        </Button>
      </div>
    </div>
  )
}

export function SidebarRail() {
  return (
    <div className="hidden lg:block lg:w-[280px]">
      <SidebarContent />
    </div>
  )
}

export function MobileSidebarTrigger() {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon-sm" aria-label="Open navigation" />
          }
        >
          <MenuIcon />
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] border-r border-border bg-background p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="h-full p-4">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
