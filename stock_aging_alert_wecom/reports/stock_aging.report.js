/**
 * Hàng tồn của kho @stNo, trễ >= @minDays ngày (= ngưỡng vàng), tồn > 0.
 * Phân loại vàng/đỏ được làm trong JS (stock-aging.service.js).
 */
module.exports = `
SELECT
  st.goods_no, st.goods_name, st.made_lot, st.unit_no,
  st.end_qty, st.end_usd, st.cust_style, st.cust_name,
  DATEDIFF(DAY, st.made_lot_date, GETDATE()) AS age_days,
  ISNULL(LTRIM(RTRIM(r.reason_dl)), N'') AS reason_dl
FROM bi_stock st
LEFT JOIN dbo.bi_stock_reason r
       ON st.goods_no = r.goods_no
      AND st.made_lot = r.made_lot
WHERE st.st_no = @stNo
  AND st.made_lot_date IS NOT NULL
  AND st.end_qty > 0
  AND DATEDIFF(DAY, st.made_lot_date, GETDATE()) >= @minDays
ORDER BY st.cust_name, age_days DESC, st.goods_no;
`
