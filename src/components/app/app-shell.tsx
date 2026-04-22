import { Navbar } from "@/components/app/navbar"
import { MobileSidebarTrigger, SidebarRail } from "@/components/app/sidebar"
import type { UserWorkspace } from "@/lib/app-types"

export function AppShell({
  children,
  workspace,
}: {
  children: React.ReactNode
  workspace: UserWorkspace | null
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--color-muted),_transparent_42%),linear-gradient(180deg,transparent,rgba(0,0,0,0.03))] px-3 py-3 md:px-4">
      <div className="mx-auto flex max-w-[1600px] gap-4">
        <SidebarRail />
        <div className="flex min-h-[calc(100vh-1.5rem)] flex-1 flex-col gap-4">
          <div className="lg:hidden">
            <div className="flex items-center gap-2">
              <MobileSidebarTrigger />
              <div className="flex-1">
                <Navbar workspace={workspace} />
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <Navbar workspace={workspace} />
          </div>
          <main className="flex-1 rounded-[32px] border border-border/70 bg-card/65 p-4 shadow-sm md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
