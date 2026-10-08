import sql from 'mssql'

export type StockReason = {
  id: number
  goods_no: string
  made_lot: string
  reason_dl: string | null
  updated_at: string
}

// =========================
// SQL SERVER CONFIG
// =========================

const config: sql.config = {
  server: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT
    ? Number(process.env.DB_PORT)
    : 1433,

  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  options: {
    encrypt: false,
    trustServerCertificate: true,
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
}

// =========================
// CONNECTION POOL
// =========================

const globalForDb = globalThis as unknown as {
  mssqlPool?: Promise<sql.ConnectionPool>
}

export function getPool() {
  if (!globalForDb.mssqlPool) {
    globalForDb.mssqlPool = new sql.ConnectionPool(config)
      .connect()
      .catch((error) => {
        globalForDb.mssqlPool = undefined
        throw error
      })
  }

  return globalForDb.mssqlPool
}

// =========================
// SEARCH PARAMS
// =========================

export type SearchParams = {
  q?: string
  filledOnly?: boolean
  goodsNo?: string
  lot?: string
  missingOnly?: boolean
}

// =========================
// SEARCH
// =========================

export async function searchReasons({
  q,
  goodsNo,
  lot,
  missingOnly,
  filledOnly,
}: SearchParams) {
  const pool = await getPool()
  const request = pool.request()

  const conditions: string[] = []

  // Tìm theo goods_no hoặc made_lot
  if (q) {
    request.input(
      'q',
      sql.NVarChar(60),
      `%${q}%`
    )

    conditions.push(
      '(goods_no LIKE @q OR made_lot LIKE @q)'
    )
  }

  // Chỉ lấy dòng đã có reason
  if (filledOnly) {
    conditions.push(
      "(reason_dl IS NOT NULL AND LTRIM(RTRIM(reason_dl)) <> '')"
    )
  }

  // Tìm theo goods_no
  if (goodsNo) {
    request.input(
      'goodsNo',
      sql.NVarChar(50),
      `%${goodsNo}%`
    )

    conditions.push(
      'goods_no LIKE @goodsNo'
    )
  }

  // Tìm theo made_lot
  if (lot) {
    request.input(
      'lot',
      sql.NVarChar(50),
      `%${lot}%`
    )

    conditions.push(
      'made_lot LIKE @lot'
    )
  }

  // Chỉ lấy dòng chưa có reason
  if (missingOnly) {
    conditions.push(
      "(reason_dl IS NULL OR LTRIM(RTRIM(reason_dl)) = '')"
    )
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const result = await request.query<StockReason>(`
    SELECT 
      id,
      goods_no,
      made_lot,
      reason_dl,
      updated_at
    FROM dbo.bi_stock_reason
    ${where}
    ORDER BY
      updated_at DESC,
      id DESC
  `)

  return result.recordset
}

// =========================
// UPSERT
// =========================

export type UpsertInput = {
  goodsNo: string
  lot: string
  reason: string
}

export async function upsertReason({
  goodsNo,
  lot,
  reason,
}: UpsertInput) {
  const pool = await getPool()

  const result = await pool
    .request()
    .input(
      'goodsNo',
      sql.NVarChar(50),
      goodsNo
    )
    .input(
      'lot',
      sql.NVarChar(50),
      lot
    )
    .input(
      'reason',
      sql.NVarChar(500),
      reason || null
    )
    .query<StockReason & { action: string }>(`
      MERGE dbo.bi_stock_reason WITH (HOLDLOCK) AS target

      USING (
        SELECT
          @goodsNo AS goods_no,
          @lot AS made_lot
      ) AS source

      ON target.goods_no = source.goods_no
      AND target.made_lot = source.made_lot

      WHEN MATCHED THEN
        UPDATE SET
          reason_dl = @reason,
          updated_at = GETDATE()

      WHEN NOT MATCHED THEN
        INSERT (
          goods_no,
          made_lot,
          reason_dl
        )
        VALUES (
          @goodsNo,
          @lot,
          @reason
        )

      OUTPUT
        $action AS action,
        inserted.id,
        inserted.goods_no,
        inserted.made_lot,
        inserted.reason_dl,
        inserted.updated_at;
    `)

  return result.recordset[0]
}

// =========================
// DELETE
// =========================

export async function deleteReason(id: number) {
  const pool = await getPool()

  await pool
    .request()
    .input('id', sql.Int, id)
    .query(`
      DELETE FROM dbo.bi_stock_reason
      WHERE id = @id
    `)
}