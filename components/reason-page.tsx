import { ClipboardList } from 'lucide-react'
import { ReasonManager } from '@/components/reason-manager'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function firstValue(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

export async function ReasonPage({ searchParams }: Props) {
  const params = await searchParams
  const goodsNo = firstValue(params.goods_no)
  const lot = firstValue(params.made_lot)

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <ClipboardList className="size-[18px]" aria-hidden="true" />
          </div>
          <span className="font-semibold tracking-tight"> 保留仓 - Reserve Materials WH Delay Reason</span>
        </div>
      </header>

      <div className="bg-[linear-gradient(180deg,var(--secondary)_0%,transparent_100%)]">
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-2 sm:px-6">
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">Stock 122 Delay Reason</h1>
          <p className="mt-1.5 text-pretty text-muted-foreground">
            Nhập và tra cứu lý do chậm trễ theo Goods No và Lot.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <ReasonManager key={`${goodsNo}|${lot}`} initialGoodsNo={goodsNo} initialLot={lot} />
      </div>
    </main>
  )
}
