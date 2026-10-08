import { NextResponse } from 'next/server'
import { deleteReason } from '@/lib/db'

export const runtime = 'nodejs'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 })
  }
  try {
    await deleteReason(numericId)
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lỗi không xác định'
    return NextResponse.json({ error: `Lỗi kết nối SQL Server: ${message}` }, { status: 500 })
  }
}
