'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export type ReasonStatus = 'all' | 'missing' | 'filled'

export type Filters = {
  goodsNo: string
  lot: string
  status: ReasonStatus
}

export const emptyFilters: Filters = { goodsNo: '', lot: '', status: 'all' }

const statusOptions: { value: ReasonStatus; label: string; hint: string }[] = [
  { value: 'all', label: 'Tất cả', hint: 'Hiển thị mọi bản ghi' },
  { value: 'missing', label: 'Chưa có lý do', hint: 'Delay Reason NULL hoặc rỗng' },
  { value: 'filled', label: 'Đã có lý do', hint: 'Đã nhập Delay Reason' },
]

export function countActiveFilters(filters: Filters) {
  return [filters.goodsNo.trim(), filters.lot.trim(), filters.status !== 'all'].filter(Boolean).length
}

type Props = {
  value: Filters
  onApply: (filters: Filters) => void
}

export function ReasonFilter({ value, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Filters>(value)
  const activeCount = countActiveFilters(value)

  function handleOpenChange(next: boolean) {
    if (next) setDraft(value)
    setOpen(next)
  }

  function apply(filters: Filters) {
    onApply(filters)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger render={<Button variant="outline" className="h-10 gap-2 bg-card px-4" />}>
        <SlidersHorizontal />
        Bộ lọc
        {activeCount > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            apply(draft)
          }}
        >
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Bộ lọc nâng cao</p>
            <p className="text-xs text-muted-foreground">Lọc chính xác theo từng trường</p>
          </div>
          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="filter-goods">Goods No</Label>
              <Input
                id="filter-goods"
                value={draft.goodsNo}
                onChange={(e) => setDraft({ ...draft, goodsNo: e.target.value })}
                placeholder="Chứa..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="filter-lot">Lot</Label>
              <Input
                id="filter-lot"
                value={draft.lot}
                onChange={(e) => setDraft({ ...draft, lot: e.target.value })}
                placeholder="Chứa..."
              />
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium">Trạng thái Delay Reason</legend>
              <RadioGroup
                value={draft.status}
                onValueChange={(status) => setDraft({ ...draft, status: status as ReasonStatus })}
                className="gap-1.5"
              >
                {statusOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`status-${option.value}`}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 font-normal transition-colors hover:bg-muted has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-secondary"
                  >
                    <RadioGroupItem id={`status-${option.value}`} value={option.value} className="mt-0.5" />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.hint}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            </fieldset>
          </div>
          <div className="flex justify-between gap-2 border-t bg-muted/50 px-4 py-3">
            <Button type="button" variant="ghost" onClick={() => apply(emptyFilters)}>
              Đặt lại
            </Button>
            <Button type="submit">Áp dụng</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
