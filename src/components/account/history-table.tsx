import { Crown, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRelativeTime, cn } from "@/lib/utils";

export interface HistoryRow {
  id: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  mode2: string;
  language: string;
  flagged: boolean;
  isPersonalBest: boolean;
  createdAt: Date | string;
}

export function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border bg-card text-sm text-muted-foreground">
        No tests yet.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WPM</TableHead>
            <TableHead className="hidden sm:table-cell">Raw</TableHead>
            <TableHead>Acc</TableHead>
            <TableHead className="hidden md:table-cell">Consistency</TableHead>
            <TableHead>Test</TableHead>
            <TableHead className="text-right">When</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id} className={cn(r.flagged && "opacity-50")}>
              <TableCell className="font-mono font-semibold text-tt-main">
                <span className="inline-flex items-center gap-1">
                  {Math.round(r.wpm)}
                  {r.isPersonalBest && <Crown className="h-3.5 w-3.5 text-yellow-400" />}
                  {r.flagged && (
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  )}
                </span>
              </TableCell>
              <TableCell className="hidden font-mono text-muted-foreground sm:table-cell">
                {Math.round(r.rawWpm)}
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">
                {Math.round(r.accuracy)}%
              </TableCell>
              <TableCell className="hidden font-mono text-muted-foreground md:table-cell">
                {Math.round(r.consistency)}%
              </TableCell>
              <TableCell className="text-muted-foreground">
                {r.mode2}{" "}
                <span className="text-xs opacity-60">{r.language}</span>
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {getRelativeTime(r.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
