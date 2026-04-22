import { BellIcon, LockIcon, WalletIcon } from "lucide-react"

import { getWorkspace } from "@/lib/app-data"
import { getAuthSession } from "@/lib/session"
import { PageTransition } from "@/components/app/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const sections = [
  { title: "Account", icon: WalletIcon, action: "Update Profile" },
  { title: "Wallet", icon: WalletIcon, action: "Disconnect Wallet" },
  { title: "Notifications", icon: BellIcon, action: "Configure Alerts" },
  { title: "Security", icon: LockIcon, action: "Review Sessions" },
]

export default async function SettingsPage() {
  const session = await getAuthSession()
  const workspace = await getWorkspace(session?.user?.id)

  return (
    <PageTransition>
      <section>
        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          User preferences and controls
        </h1>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <Card
              key={section.title}
              className="rounded-3xl border border-border/70 bg-card/95 shadow-sm"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  {section.title === "Wallet" && workspace?.wallet
                    ? `Primary wallet: ${workspace.wallet}`
                    : `Preference controls for ${section.title.toLowerCase()} management.`}
                </p>
                <Switch defaultChecked />
              </CardContent>
              <CardContent>
                <Button variant="outline">{section.action}</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </PageTransition>
  )
}
