import { Clock3Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function CountdownTimer({ value }: { value: string }) {
  return (
    <Badge variant="outline" className="gap-1.5 rounded-full px-2.5">
      <Clock3Icon data-icon="inline-start" />
      {value}
    </Badge>
  )
}
