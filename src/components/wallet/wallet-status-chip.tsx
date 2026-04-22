"use client"

import { AlertTriangleIcon, Wallet2Icon } from "lucide-react"
import { useAccount, useChainId } from "wagmi"

import { Badge } from "@/components/ui/badge"

function truncate(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function WalletStatusChip({
  fallback,
}: {
  fallback: string | null
}) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const isSepolia = chainId === 11155111

  if (isConnected && address) {
    return (
      <Badge variant="outline" className="hidden rounded-full px-3 py-1 sm:inline-flex">
        {isSepolia ? (
          <Wallet2Icon data-icon="inline-start" />
        ) : (
          <AlertTriangleIcon data-icon="inline-start" />
        )}
        {truncate(address)}
      </Badge>
    )
  }

  if (fallback) {
    return (
      <Badge variant="outline" className="hidden rounded-full px-3 py-1 sm:inline-flex">
        <Wallet2Icon data-icon="inline-start" />
        {truncate(fallback)}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="hidden rounded-full px-3 py-1 sm:inline-flex">
      Wallet not linked
    </Badge>
  )
}
