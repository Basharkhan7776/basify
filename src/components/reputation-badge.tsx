import { ShieldCheckIcon, SparklesIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function ReputationBadge({ score }: { score: number }) {
  const variant =
    score >= 90 ? "default" : score >= 75 ? "secondary" : "outline"

  return (
    <Badge variant={variant}>
      {score >= 90 ? <ShieldCheckIcon data-icon="inline-start" /> : <SparklesIcon data-icon="inline-start" />}
      Reputation {score}
    </Badge>
  )
}
