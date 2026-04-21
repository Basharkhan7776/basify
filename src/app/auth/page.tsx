import { AlertCircleIcon, BoxesIcon, WalletIcon } from "lucide-react"

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

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_28%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%)]">
      <Card className="w-full max-w-lg rounded-[32px] border border-border/70 bg-card/95 shadow-sm">
        <CardHeader>
          <CardDescription>Onboarding</CardDescription>
          <CardTitle className="text-3xl">Access your liquidity workspace</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Button variant="outline">Continue with Google</Button>
            <Button variant="outline">
              <BoxesIcon data-icon="inline-start" />
              Continue with GitHub
            </Button>
            <Button>
              <WalletIcon data-icon="inline-start" />
              Connect Wallet
            </Button>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="wallet-preview">Wallet address preview</FieldLabel>
              <FieldContent>
                <Input id="wallet-preview" value="0x72beC71F...B013" readOnly />
                <FieldDescription>
                  Mock preview only. No wallet provider is connected.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <FieldContent>
                <Input id="username" placeholder="bashar.eth" />
              </FieldContent>
            </Field>
            <div className="rounded-2xl border border-dashed border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <AlertCircleIcon className="size-4" />
                Wallet already registered
              </div>
              <p className="mt-1">
                This placeholder simulates validation messaging for existing members.
              </p>
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}
