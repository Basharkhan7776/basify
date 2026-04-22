import { parseUnits } from "viem"

import { canWriteToFactory, factoryAbi, getOperatorWalletClient } from "@/lib/contracts/config"
import { env } from "@/lib/env"

type CreatePoolInput = {
  managerWallet: string
  name: string
  slug: string
  contributionAmount: number
  memberLimit: number
  totalRounds: number
  biddingEnabled: boolean
  securityDeposit: number
  gracePenalty: number
  roundDurationHours: number
  gracePeriodHours: number
}

export async function deployPoolOnchain(input: CreatePoolInput) {
  if (!canWriteToFactory()) {
    return {
      handlerAddress: "",
      vaultAddress: "",
      txHash: "",
      simulated: true,
    }
  }

  const walletClient = getOperatorWalletClient()
  if (!walletClient) {
    return {
      handlerAddress: "",
      vaultAddress: "",
      txHash: "",
      simulated: true,
    }
  }

  const txHash = await walletClient.writeContract({
    address: env.factoryAddress as `0x${string}`,
    abi: factoryAbi,
    functionName: "createPool",
    args: [
      input.managerWallet as `0x${string}`,
      env.tokenAddress as `0x${string}`,
      BigInt(input.memberLimit),
      BigInt(input.totalRounds),
      input.biddingEnabled,
      parseUnits(String(input.contributionAmount), 6),
      parseUnits(String(input.securityDeposit), 6),
      parseUnits(String(input.gracePenalty), 6),
      BigInt(input.roundDurationHours * 60 * 60),
      BigInt(input.gracePeriodHours * 60 * 60),
      input.slug,
      input.name,
    ],
  })

  return {
    handlerAddress: "",
    vaultAddress: "",
    txHash,
    simulated: false,
  }
}
