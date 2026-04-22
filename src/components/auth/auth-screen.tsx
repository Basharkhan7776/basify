"use client"

import { useMemo, useState } from "react"
import {
  AlertCircleIcon,
  BoxesIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain } from "wagmi"

import { authClient } from "@/lib/auth-client"
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

type AuthScreenProps = {
  initialUsername: string
  walletPreview: string
  isGoogleEnabled: boolean
  isGithubEnabled: boolean
  isSignedIn: boolean
}

export function AuthScreen(props: AuthScreenProps) {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState("")
  const [username, setUsername] = useState(props.initialUsername)
  const [linkingWallet, setLinkingWallet] = useState(false)
  const { address, isConnected, chainId } = useAccount()
  const { connect, connectors, isPending: isWalletPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { switchChainAsync } = useSwitchChain()
  const session = authClient.useSession()

  const walletDisplay = useMemo(
    () => address ?? props.walletPreview,
    [address, props.walletPreview]
  )

  async function signIn(provider: "google" | "github") {
    setErrorMessage("")

    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    })
  }

  async function linkWallet() {
    if (!address) {
      return
    }

    setErrorMessage("")
    setLinkingWallet(true)

    try {
      if (chainId !== 11155111) {
        await switchChainAsync({ chainId: 11155111 })
      }

      const challengeResponse = await fetch("/api/wallet/challenge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, username }),
      })

      const challenge = await challengeResponse.json()
      if (!challengeResponse.ok) {
        throw new Error(challenge.error ?? "Unable to create a wallet challenge.")
      }

      const signature = await signMessageAsync({
        message: challenge.message,
      })

      const linkResponse = await fetch("/api/wallet/link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          address,
          message: challenge.message,
          signature,
          username,
        }),
      })

      const linkResult = await linkResponse.json()
      if (!linkResponse.ok) {
        throw new Error(linkResult.error ?? "Wallet verification failed.")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Wallet verification failed."
      )
    } finally {
      setLinkingWallet(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_28%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%)]">
      <Card className="w-full max-w-lg rounded-[32px] border border-border/70 bg-card/95 shadow-sm">
        <CardHeader>
          <CardDescription>OAuth + wallet onboarding</CardDescription>
          <CardTitle className="text-3xl">Access your liquidity workspace</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Button
              variant="outline"
              onClick={() => signIn("google")}
              disabled={!props.isGoogleEnabled}
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              onClick={() => signIn("github")}
              disabled={!props.isGithubEnabled}
            >
              <BoxesIcon data-icon="inline-start" />
              Continue with GitHub
            </Button>
            <Button
              onClick={() =>
                connect({
                  connector: connectors[0],
                })
              }
              disabled={isWalletPending}
            >
              <WalletIcon data-icon="inline-start" />
              {isConnected ? "Wallet Connected" : "Connect Wallet"}
            </Button>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="wallet-preview">Wallet address preview</FieldLabel>
              <FieldContent>
                <Input id="wallet-preview" value={walletDisplay} readOnly />
                <FieldDescription>
                  Wallet binding happens after OAuth. Chain is forced to Sepolia.
                </FieldDescription>
              </FieldContent>
            </Field>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <FieldContent>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="bashar.eth"
                />
              </FieldContent>
            </Field>
            <div className="rounded-2xl border border-dashed border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ShieldCheckIcon className="size-4" />
                OAuth first, wallet second
              </div>
              <p className="mt-1">
                The app account is owned by your OAuth identity. Wallets are verified
                capabilities inside the workspace.
              </p>
            </div>
            {(errorMessage || props.isSignedIn) && (
              <div className="rounded-2xl border border-dashed border-border bg-muted/35 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <AlertCircleIcon className="size-4" />
                  {errorMessage ? "Wallet already registered or verification failed" : "Session active"}
                </div>
                <p className="mt-1">
                  {errorMessage ||
                    `Signed in as ${session.data?.user.email ?? "your OAuth account"}. Link one primary wallet to enter the app.`}
                </p>
              </div>
            )}
          </FieldGroup>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={linkWallet}
              disabled={!props.isSignedIn || !isConnected || linkingWallet}
              className="flex-1"
            >
              {linkingWallet ? (
                <LoaderCircleIcon className="animate-spin" data-icon="inline-start" />
              ) : (
                <WalletIcon data-icon="inline-start" />
              )}
              Verify and enter app
            </Button>
            {isConnected ? (
              <Button variant="outline" onClick={() => disconnect()}>
                Disconnect Wallet
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
