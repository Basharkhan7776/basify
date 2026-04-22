import { createPublicClient, createWalletClient, http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { sepolia } from "viem/chains"

import { env } from "@/lib/env"

export const protocolChain = sepolia

export const factoryAbi = [
  {
    type: "function",
    name: "createPool",
    stateMutability: "nonpayable",
    inputs: [
      { name: "poolManager", type: "address" },
      { name: "poolToken", type: "address" },
      { name: "memberLimit", type: "uint256" },
      { name: "totalRounds", type: "uint256" },
      { name: "biddingEnabled", type: "bool" },
      { name: "monthlyContributionAmount", type: "uint256" },
      { name: "requiredSecurityDeposit", type: "uint256" },
      { name: "gracePeriodPenaltyFee", type: "uint256" },
      { name: "primaryWindowDuration", type: "uint256" },
      { name: "gracePeriodDuration", type: "uint256" },
      { name: "slug", type: "string" },
      { name: "name", type: "string" },
    ],
    outputs: [
      { name: "handler", type: "address" },
      { name: "vault", type: "address" },
    ],
  },
  {
    type: "event",
    name: "PoolCreated",
    inputs: [
      { indexed: true, name: "poolManager", type: "address" },
      { indexed: true, name: "handler", type: "address" },
      { indexed: true, name: "vault", type: "address" },
      { indexed: false, name: "slug", type: "string" },
      { indexed: false, name: "name", type: "string" },
    ],
    anonymous: false,
  },
] as const

export function getPublicChainClient() {
  return createPublicClient({
    chain: protocolChain,
    transport: http(env.sepoliaRpcUrl),
  })
}

export function getOperatorWalletClient() {
  if (!env.walletOperatorKey) {
    return null
  }

  const account = privateKeyToAccount(
    env.walletOperatorKey.startsWith("0x")
      ? (env.walletOperatorKey as `0x${string}`)
      : (`0x${env.walletOperatorKey}` as `0x${string}`)
  )

  return createWalletClient({
    account,
    chain: protocolChain,
    transport: http(env.sepoliaRpcUrl),
  })
}

export function canWriteToFactory() {
  return Boolean(env.factoryAddress && env.walletOperatorKey && env.tokenAddress)
}
