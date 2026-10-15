'use client'

import { useState, type FormEvent } from 'react'
import { Save, RotateCcw, Link2, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLang } from '@/lib/i18n'

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
  const { t } = useLang()
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
      if (!response.ok) throw new Error(data.error ?? t.saveFailed)
      onSaved(data.action === 'UPDATE' ? t.savedUpdate(data.goods_no, data.made_lot) : t.savedNew(data.goods_no, data.made_lot))
    } catch (err) {
      setError(err instanceof Error ? err.message : t.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="overflow-hidden border-primary/15 py-0 shadow-sm">
      <div className="h-1 bg-primary" aria-hidden="true" />
      <CardHeader className="pt-5">
        <CardTitle className="text-base">{t.enterReason}</CardTitle>
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
              {source === 'link' ? t.prefilledLink : t.prefilledRow} {t.editHint}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="goodsNo">
                {t.itemsNo} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="goodsNo"
                required
                maxLength={50}
                value={values.goodsNo}
                onChange={(e) => update('goodsNo')(e.target.value)}
                placeholder={t.placeholderGoods}
                className="bg-muted/60 font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lot">
                {t.lot} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lot"
                required
                maxLength={50}
                value={values.lot}
                onChange={(e) => update('lot')(e.target.value)}
                placeholder={t.placeholderLot}
                className="bg-muted/60 font-medium"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reason">{t.delayReason}</Label>
            <Textarea
              id="reason"
              maxLength={500}
              rows={4}
              autoFocus={prefilled}
              value={values.reason}
              onChange={(e) => update('reason')(e.target.value)}
              placeholder={t.placeholderReason}
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
              {saving ? t.saving : t.save}
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
              {t.resetForm}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
