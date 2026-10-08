'use client'

import { useState, type FormEvent } from 'react'
import { Save, RotateCcw, Link2, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export type FormValues = {
  goodsNo: string
  lot: string
  reason: string
}

export const emptyForm: FormValues = { goodsNo: '', lot: '', reason: '' }

export type FormSource = 'link' | 'row' | null

type Props = {
  values: FormValues
  source: FormSource
  onChange: (values: FormValues) => void
  onReset: () => void
  onSaved: (message: string) => void
}

export function ReasonForm({ values, source, onChange, onReset, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof FormValues) => (value: string) => onChange({ ...values, [field]: value })
  const prefilled = source !== null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const response = await fetch('/api/reasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Lưu thất bại')
      onSaved(
        data.action === 'UPDATE'
          ? `Đã cập nhật ${data.goods_no} / ${data.made_lot}`
          : `Đã thêm mới ${data.goods_no} / ${data.made_lot}`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="overflow-hidden border-primary/15 py-0 shadow-sm">
      <div className="h-1 bg-primary" aria-hidden="true" />
      <CardHeader className="pt-5">
        <CardTitle className="text-base">Nhập Delay Reason</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        {prefilled && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-secondary px-3 py-2.5 text-sm text-secondary-foreground">
            {source === 'link' ? (
              <Link2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <PencilLine className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            )}
            <p className="text-pretty">
              {source === 'link' ? 'Đã điền sẵn từ báo cáo BI.' : 'Đã điền từ dòng bạn chọn.'} Bạn có thể sửa Goods
              No / Lot nếu cần.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="goodsNo">
                Goods No <span className="text-destructive">*</span>
              </Label>
              <Input
                id="goodsNo"
                required
                maxLength={50}
                value={values.goodsNo}
                onChange={(e) => update('goodsNo')(e.target.value)}
                placeholder="VD: GD-001"
                className="bg-muted/60 font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lot">
                Lot <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lot"
                required
                maxLength={50}
                value={values.lot}
                onChange={(e) => update('lot')(e.target.value)}
                placeholder="VD: LOT2026"
                className="bg-muted/60 font-medium"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">Delay Reason</Label>
            <Textarea
              id="reason"
              maxLength={500}
              rows={4}
              autoFocus={prefilled}
              value={values.reason}
              onChange={(e) => update('reason')(e.target.value)}
              placeholder="Nhập lý do chậm trễ..."
              className="resize-y"
            />
            <p className="text-right text-xs text-muted-foreground tabular-nums">{values.reason.length}/500</p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving} className="flex-1">
              <Save />
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setError(null)
                onReset()
              }}
            >
              <RotateCcw />
              Làm mới
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
