import { NextResponse, type NextRequest } from 'next/server'
import { searchReasons, upsertReason } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Lỗi không xác định'
  console.error('[bi_stock_reason]', message)
  return NextResponse.json({ error: `Lỗi kết nối SQL Server: ${message}` }, { status: 500 })
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  try {
    const status = params.get('status')
    const rows = await searchReasons({
      q: params.get('q')?.trim().slice(0, 50) || undefined,
      goodsNo: params.get('goodsNo')?.trim().slice(0, 50) || undefined,
      lot: params.get('lot')?.trim().slice(0, 50) || undefined,
      missingOnly: status === 'missing' || params.get('missing') === '1',
      filledOnly: status === 'filled',
    })
    return NextResponse.json(rows)
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
  }

  const goodsNo = String(body.goodsNo ?? '').trim()
  const lot = String(body.lot ?? '').trim()
  const reason = String(body.reason ?? '').trim()

  if (!goodsNo || !lot) {
    return NextResponse.json({ error: 'Goods No và Lot là bắt buộc' }, { status: 400 })
  }
  if (goodsNo.length > 50 || lot.length > 50) {
    return NextResponse.json({ error: 'Goods No, Lot tối đa 50 ký tự' }, { status: 400 })
  }
  if (reason.length > 500) {
    return NextResponse.json({ error: 'Delay Reason tối đa 500 ký tự' }, { status: 400 })
  }

  try {
    const row = await upsertReason({ goodsNo, lot, reason })
    return NextResponse.json(row)
  } catch (error) {
    return errorResponse(error)
  }
}
