import { Member } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { ReputationBadge } from "@/components/reputation-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function MemberTable({
  members,
  compact = false,
}: {
  members: Member[]
  compact?: boolean
}) {
  return (
    <Table className={cn(compact && "text-xs")}>
      <TableHeader>
        <TableRow>
          <TableHead>Member</TableHead>
          <TableHead>Wallet</TableHead>
          <TableHead>Reputation</TableHead>
          <TableHead>Contribution Status</TableHead>
          <TableHead>Rounds Received</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.wallet}>
            <TableCell className="font-medium">{member.name}</TableCell>
            <TableCell className="font-mono text-muted-foreground">
              {member.wallet}
            </TableCell>
            <TableCell>
              <ReputationBadge score={member.reputation} />
            </TableCell>
            <TableCell>{member.contributionStatus}</TableCell>
            <TableCell>{member.roundsReceived}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
