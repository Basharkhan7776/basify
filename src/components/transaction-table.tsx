import { Transaction, formatUsd } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function TransactionTable({
  transactions,
}: {
  transactions: Transaction[]
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={`${transaction.type}-${index}`}>
            <TableCell className="font-medium">{transaction.type}</TableCell>
            <TableCell>{formatUsd(transaction.amount)}</TableCell>
            <TableCell>
              <Badge variant={transaction.status === "Confirmed" ? "secondary" : "outline"}>
                {transaction.status}
              </Badge>
            </TableCell>
            <TableCell>{transaction.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
