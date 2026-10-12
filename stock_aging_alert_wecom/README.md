# stock_aging_alert_wecom

Cảnh báo hàng tồn kho quá hạn (mặc định ≥ 180 ngày) qua WeCom. Mỗi dòng tồn được gán cho **người phụ trách theo `cust_name`**, bot gửi 1 tin text **@tag đúng người** + file Excel chi tiết.

## Luồng chạy
1. Query `bi_stock` (kho `STOCK_ST_NO`, tồn > 0, trễ ≥ `STOCK_YELLOW_DAYS`). **Hàng Normal (< 90 ngày) không được gửi.**
2. Phân loại theo `age_days`: 🟡 vàng 90–179 ngày (≥ 3 tháng), 🔴 đỏ ≥ 180 ngày (≥ 6 tháng).
3. Gom theo `cust_name`, tra `config/owners.json` để @tag người phụ trách (không khớp → `default`).
4. Với mỗi `cust_name`, xét **riêng từng mức** (đỏ trước, vàng sau). Mỗi mức gửi:
   - **1 thẻ WeCom**: **khối màu to (đỏ / vàng) ở trên cùng**, thông tin ở dưới (khách hàng, số dòng, trễ nhất, tổng USD, người phụ trách).
     - **≤ 3 dòng** (mỗi dòng = 1 mã + 1 lot, luôn bằng số dòng trong Excel): liệt kê `goods_no · lot · số ngày`; có `reason_dl` thì hiện dòng lý do bên dưới.
     - **> 3 dòng**: thẻ tóm tắt + 1 file Excel gửi ngay sau (cột: Items No, Items Name, Lot, Unit, PRICE USD, Cust Style, Stock Days, Delay Reason).
   - **1 tin text ngắn** ngay sau đó để **@tag** người phụ trách (thẻ không @tag được).

### Khối màu = ảnh banner
WeCom không cho tô nền thẻ, nên "khối màu" là ảnh banner (`card_image`) của thẻ. Ảnh có sẵn: `assets/banner_red.png`, `assets/banner_yellow.png`. WeCom cần **URL** của ảnh:
1. Chạy `npm run serve-banners` (server nhỏ, cổng 3010; nên chạy nền bằng pm2/systemd), hoặc tự upload 2 ảnh lên web server nội bộ/public bất kỳ.
2. Điền vào `.env`: `STOCK_RED_IMAGE=http://<IP-server>:3010/banner_red.png`, `STOCK_YELLOW_IMAGE=http://<IP-server>:3010/banner_yellow.png`.
3. Máy của người nhận WeCom phải truy cập được URL đó (mạng nội bộ cũng được nếu họ dùng WeCom trong mạng đó).

Chưa điền URL → tự dùng thẻ không ảnh (icon 🔴/🟡 + số lớn ở giữa). Muốn đổi chữ/màu banner: sửa `services/banner.service.js` rồi `npm run banners`.

> WeCom bắt buộc thẻ có link khi bấm; mặc định mở https://work.weixin.qq.com, đổi bằng `STOCK_CARD_URL`.
> `npm run dry-run` in JSON của thẻ ra màn hình để kiểm tra trước khi gửi thật.

## Cấu hình người phụ trách — `config/owners.json`
```json
{
  "rules": [
    { "name": "Nike", "match": ["NIKE"], "userIds": ["huyen.suong"] },
    { "name": "Adidas", "match": ["ADIDAS", "ADI"], "userIds": ["an.nguyen", "binh.tran"] }
  ],
  "default": { "name": "Chưa phân công", "userIds": ["quan_ly_kho"] }
}
```
- `match`: chuỗi con của `cust_name`, không phân biệt hoa/thường/dấu. Rule đầu tiên khớp sẽ thắng → đặt rule cụ thể lên trước.
- `userIds`: **WeCom userid** (không phải tên hiển thị). Một khách có thể tag nhiều người.
- Thêm/đổi người chỉ cần sửa file này, không đụng code.

## Cài đặt
```bash
cp .env.example .env     # điền DB + WECOM_WEBHOOK_STOCK
npm ci
npm test                 # chạy test
npm run dry-run          # (chạy được cả Windows) query thật nhưng KHÔNG gửi WeCom, in nội dung + giữ Excel ở excel_reports/
npm start                # chạy thật
```

## Chạy định kỳ (Linux cron)
```
0 8 * * 1 /home/it/stock_aging_alert_wecom/run-job-stock_aging.sh   # 8h sáng thứ 2 hàng tuần
```
Sửa `PROJECT_DIR`, `NODE_BIN` trong `run-job-stock_aging.sh` cho đúng máy chủ.

## Biến môi trường quan trọng
| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `STOCK_ST_NO` | 122 | Kho cần cảnh báo |
| `STOCK_YELLOW_DAYS` | 90 | Ngưỡng 🟡 |
| `STOCK_RED_DAYS` | 180 | Ngưỡng 🔴 |
| `MAX_CODES_IN_MESSAGE` | 3 | Vượt số mã này của 1 mức (đỏ/vàng) của 1 khách → gửi file Excel |
| `DRY_RUN` | false | true = không gửi WeCom |

## Lưu ý
- `@tag` cần đúng WeCom `userid`; markdown dùng cú pháp `<@userid>`.
- Markdown WeCom giới hạn 4096 byte; với ≤ 3 mã luôn nằm trong giới hạn.
