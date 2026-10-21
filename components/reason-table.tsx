'use client'

import type { StockReason } from '@/lib/db'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLang, locales } from '@/lib/i18n'
import { cn } from '@/lib/utils'

type Props = {
  rows: StockReason[]
  selectedKey: string | null
  onSelect: (row: StockReason) => void
}

const qtyFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const usdFormatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmt = (value: number | null | undefined, formatter: Intl.NumberFormat) =>
  value == null ? '-' : formatter.format(Number(value))

export const rowKey = (goodsNo: string, lot: string) => `${goodsNo.trim()}|${lot.trim()}`

export function ReasonTable({ rows, selectedKey, onSelect }: Props) {
  const { t, lang } = useLang()
  const dateFormatter = new Intl.DateTimeFormat(locales[lang], {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC',
  })

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/60 [&_th]:text-xs [&_th]:font-semibold [&_th]:tracking-wide [&_th]:whitespace-nowrap [&_th]:text-muted-foreground [&_th]:uppercase">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">{t.itemsNo}</TableHead>
            <TableHead className="font-semibold">{t.itemsName}</TableHead>
            <TableHead className="font-semibold">{t.lot}</TableHead>
            <TableHead className="font-semibold">{t.unit}</TableHead>
            <TableHead className="text-right font-semibold">{t.quantity}</TableHead>
            <TableHead className="text-right font-semibold">{t.priceUsd}</TableHead>
            <TableHead className="font-semibold">{t.custStyle}</TableHead>
            <TableHead className="font-semibold">{t.buyer}</TableHead>
            <TableHead className="text-right font-semibold">{t.stockDays}</TableHead>
            <TableHead className="min-w-56 font-semibold">{t.delayReason}</TableHead>
            <TableHead className="font-semibold">{t.updated}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const missing = !row.reason_dl || row.reason_dl.trim() === ''
            const selected = selectedKey === rowKey(row.goods_no, row.made_lot)
            const days = row.age_days
            return (
              <TableRow
                key={row.id}
                onClick={() => onSelect(row)}
                data-state={selected ? 'selected' : undefined}
                className={cn('cursor-pointer', selected && 'bg-secondary hover:bg-secondary')}
              >
                <TableCell className="font-semibold tracking-tight whitespace-nowrap">
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
                <TableCell className="max-w-64 whitespace-normal 2xl:max-w-96">{row.goods_name?.trim() || '-'}</TableCell>
                <TableCell className="font-medium whitespace-nowrap tabular-nums">{row.made_lot}</TableCell>
                <TableCell className="whitespace-nowrap">{row.unit_no?.trim() || '-'}</TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">{fmt(row.end_qty, qtyFormatter)}</TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">{fmt(row.end_usd, usdFormatter)}</TableCell>
                <TableCell className="whitespace-nowrap">{row.cust_style?.trim() || '-'}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{row.cust_name?.trim() || '-'}</TableCell>
                <TableCell
                  className={cn(
                    'text-right font-medium whitespace-nowrap tabular-nums',
                    days != null && days >= 180 && 'text-destructive',
                  )}
                >
                  {days ?? '-'}
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  {missing ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning-foreground ring-1 ring-warning/40">
                      <span className="size-1.5 rounded-full bg-warning" aria-hidden="true" />
                      {t.missingReason}
                    </span>
                  ) : (
                    row.reason_dl
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
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