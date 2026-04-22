"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export function JoinPoolActions({ poolId }: { poolId: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function joinPool() {
    setIsSubmitting(true)
    setErrorMessage("")

    const response = await fetch(`/api/pools/${poolId}/join`, {
      method: "POST",
    })
    const data = await response.json()

    setIsSubmitting(false)

    if (!response.ok) {
      setErrorMessage(data.error ?? "Unable to join this pool.")
      return
    }

    router.push(`/pools/${poolId}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" type="button">
          Approve
        </Button>
        <Button onClick={joinPool} disabled={isSubmitting}>
          {isSubmitting ? "Joining..." : "Join Pool"}
        </Button>
      </div>
      {errorMessage ? (
        <p className="text-sm text-destructive">{errorMessage}</p>
      ) : null}
    </div>
  )
}
