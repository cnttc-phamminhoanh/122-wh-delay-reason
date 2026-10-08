'use client'

import type { StockReason } from '@/lib/db'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

type Props = {
  rows: StockReason[]
  selectedKey: string | null
  onSelect: (row: StockReason) => void
}

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'UTC',
})

export const rowKey = (goodsNo: string, lot: string) => `${goodsNo.trim()}|${lot.trim()}`

export function ReasonTable({ rows, selectedKey, onSelect }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/60 [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:text-muted-foreground [&_th]:uppercase">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Goods No</TableHead>
            <TableHead className="font-semibold">Lot</TableHead>
            <TableHead className="min-w-56 font-semibold">Delay Reason</TableHead>
            <TableHead className="font-semibold">Cập nhật</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const missing = !row.reason_dl || row.reason_dl.trim() === ''
            const selected = selectedKey === rowKey(row.goods_no, row.made_lot)
            return (
              <TableRow
                key={row.id}
                onClick={() => onSelect(row)}
                data-state={selected ? 'selected' : undefined}
                className={cn('cursor-pointer', selected && 'bg-secondary hover:bg-secondary')}
              >
                <TableCell className="font-semibold tracking-tight">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(row)
                    }}
                    className="rounded-sm text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {row.goods_no}
                  </button>
                </TableCell>
                <TableCell className="font-medium tabular-nums">{row.made_lot}</TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  {missing ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning-foreground ring-1 ring-warning/40">
                      <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
                      Chưa có lý do
                    </span>
                  ) : (
                    row.reason_dl
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground tabular-nums">
                  {dateFormatter.format(new Date(row.updated_at))}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}