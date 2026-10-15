'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Search, RefreshCw, CheckCircle2, X, Database, AlertTriangle, CircleCheckBig } from 'lucide-react'
import type { StockReason } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReasonForm, emptyForm, type FormSource, type FormValues } from '@/components/reason-form'
import { ReasonTable, rowKey } from '@/components/reason-table'
import { ReasonFilter, emptyFilters, countActiveFilters, type Filters } from '@/components/reason-filter'
import { useLang } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const LOAD_ERROR = 'LOAD_ERROR'

const fetcher = async (url: string): Promise<StockReason[]> => {
  const response = await fetch(url)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? LOAD_ERROR)
  return data
}

const isMissing = (row: StockReason) => !row.reason_dl || row.reason_dl.trim() === ''



type Props = {
  initialGoodsNo: string
  initialLot: string
}

export function ReasonManager({ initialGoodsNo, initialLot }: Props) {
  const { t } = useLang()
  const [form, setForm] = useState<FormValues>({ ...emptyForm, goodsNo: initialGoodsNo, lot: initialLot })
  const [source, setSource] = useState<FormSource>(initialGoodsNo || initialLot ? 'link' : null)
  const [searchInput, setSearchInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [notice, setNotice] = useState<string | null>(null)

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20 // Hiển thị 20 bản ghi mỗi trang

  
  const statusLabel = { missing: t.missingReason, filled: t.hasReason } as const

  useEffect(() => {
    if (initialGoodsNo || initialLot) {
      setForm({
        goodsNo: initialGoodsNo,
        lot: initialLot,
        reason: '',
      })
      setSource('link')
    }
  }, [initialGoodsNo, initialLot])

  // Tự động quay về trang 1 khi tìm kiếm hoặc thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1)
  }, [keyword, filters, searchInput])

  const query = new URLSearchParams()
  if (keyword) query.set('q', keyword)
  if (filters.goodsNo.trim()) query.set('goodsNo', filters.goodsNo.trim())
  if (filters.lot.trim()) query.set('lot', filters.lot.trim())
  if (filters.buyer.trim()) query.set('buyer', filters.buyer.trim())
  if (filters.status !== 'all') query.set('status', filters.status)

  const { data, error, isLoading, isValidating, mutate } = useSWR(`/api/reasons?${query}`, fetcher, {
    keepPreviousData: true,
    shouldRetryOnError: false,
    onSuccess: (rows) => {
      if (source !== 'link' || form.reason) return
      const existing = rows.find((r) => rowKey(r.goods_no, r.made_lot) === rowKey(form.goodsNo, form.lot))
      if (existing?.reason_dl) setForm((f) => ({ ...f, reason: existing.reason_dl ?? '' }))
    },
  })

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = searchInput.trim()
    if (next === keyword) mutate()
    else setKeyword(next)
  }

  function clearAll() {
    setSearchInput('')
    setKeyword('')
    setFilters(emptyFilters)
  }

  function handleSaved(message: string) {
    setNotice(message)
    mutate()
  }

  function handleSelect(row: StockReason) {
    setForm({
      goodsNo: row.goods_no,
      lot: row.made_lot,
      reason: row.reason_dl ?? '',
    })
    setSource('row')
    setNotice(null)
    if (window.matchMedia('(max-width: 1023px)').matches) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleReset() {
    setForm(emptyForm)
    setSource(null)
    setNotice(null)
  }

  const rows = data ?? []
  const missingCount = rows.filter(isMissing).length
  const activeFilterCount = countActiveFilters(filters)
  const hasCriteria = Boolean(keyword) || activeFilterCount > 0

  // Logic tính toán phân trang
  const totalPages = Math.ceil(rows.length / pageSize) || 1
  const paginatedRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const chips = [
    keyword && { label: `${t.keyword}: ${keyword}`, clear: () => (setKeyword(''), setSearchInput('')) },
    filters.goodsNo.trim() && {
      label: `Items No: ${filters.goodsNo.trim()}`,
      clear: () => setFilters({ ...filters, goodsNo: '' }),
    },
    filters.lot.trim() && { label: `${t.lot}: ${filters.lot.trim()}`, clear: () => setFilters({ ...filters, lot: '' }) },
    filters.status !== 'all' && {
      label: statusLabel[filters.status],
      clear: () => setFilters({ ...filters, status: 'all' }),
    },
    filters.buyer.trim() && {
      label: `${t.buyer}: ${filters.buyer.trim()}`,
      clear: () => setFilters({ ...filters, buyer: '' }),
    },
  ].filter(Boolean) as { label: string; clear: () => void }[]

  return (
    <div className="flex flex-col gap-6">
      <section aria-label={t.statistics} className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Database} label={t.totalRecords} value={error ? '—' : rows.length} tone="primary" />
        <StatCard
          icon={AlertTriangle}
          label={t.missingReason}
          value={error ? '—' : missingCount}
          tone="warning"
          onClick={() => setFilters({ ...filters, status: 'missing' })}
          actionLabel={t.filterNow}
        />
        <StatCard
          icon={CircleCheckBig}
          label={t.hasReason}
          value={error ? '—' : rows.length - missingCount}
          tone="success"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <ReasonForm values={form} source={source} onChange={setForm} onReset={handleReset} onSaved={handleSaved} />
          {notice && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-soft px-4 py-3 text-sm font-medium"
            >
              <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden="true" />
              {notice}
            </p>
          )}
        </div>

        <section
          aria-labelledby="list-title"
          className="flex min-w-0 flex-col rounded-2xl border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-12px_rgba(16,24,40,0.12)]"
        >
          <div className="flex flex-col gap-4 border-b px-5 pt-5 pb-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="list-title" className="text-base font-semibold tracking-tight">
                  {t.list}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => mutate()}
                disabled={isValidating}
                aria-label={t.reload}
                className="text-muted-foreground"
              >
                <RefreshCw className={isValidating ? 'animate-spin' : undefined} />
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <form role="search" onSubmit={handleSearch} className="flex flex-1 gap-2">
                <label htmlFor="keyword" className="sr-only">
                  {t.searchLabel}
                </label>
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="keyword"
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="h-10 bg-muted/40 pl-9"
                  />
                </div>
                <Button type="submit" className="h-10 px-5">
                  <Search />
                  {t.search}
                </Button>
              </form>
              <ReasonFilter value={filters} onApply={setFilters} />
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-secondary py-1 pr-1 pl-3 text-xs font-medium text-secondary-foreground"
                  >
                    {chip.label}
                    <button
                      type="button"
                      onClick={chip.clear}
                      aria-label={`${t.remove} ${chip.label}`}
                      className="rounded-full p-0.5 hover:bg-primary/10"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {t.clearAll}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 p-5">
            {error ? (
              <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error.message === LOAD_ERROR ? t.loadError : error.message}
              </p>
            ) : isLoading && !data ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{t.loading}</p>
            ) : rows.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-12 text-center">
                <Search className="size-6 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium">{t.noData}</p>
                {hasCriteria && (
                  <Button variant="link" size="sm" onClick={clearAll}>
                    {t.clearFilters}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <ReasonTable
                  rows={paginatedRows}
                  selectedKey={source ? rowKey(form.goodsNo, form.lot) : null}
                  onSelect={handleSelect}
                />

                {/* Thanh điều hướng Phân trang */}
                <div className="flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row">
                  <p className="text-xs text-muted-foreground">
                    {t.showing(
                      rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1,
                      Math.min(currentPage * pageSize, rows.length),
                      rows.length,
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3 text-xs"
                    >
                      {t.prevPage}
                    </Button>
                    <span className="px-1 text-xs font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 text-xs"
                    >
                      {t.nextPage}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

const toneStyles = {
  primary: 'bg-secondary text-primary',
  warning: 'bg-warning-soft text-warning-foreground',
  success: 'bg-success-soft text-success',
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  onClick,
  actionLabel,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  tone: keyof typeof toneStyles
  onClick?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', toneStyles[tone])}>
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl leading-tight font-semibold tracking-tight tabular-nums">{value}</p>
      </div>
      {onClick && actionLabel && (
        <Button variant="ghost" size="sm" onClick={onClick} className="text-warning-foreground">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}