// Tạo banner đỏ -> assets/banner_red.png
// Chạy: npm run banners
const path = require("path");
const fs = require("fs/promises");
const { renderBannerPng } = require("../services/banner.service");

(async () => {
  const dir = path.join(__dirname, "../assets");
  await fs.mkdir(dir, { recursive: true });

  const file = path.join(dir, "banner_red.png");
  const buffer = await renderBannerPng();
  await fs.writeFile(file, buffer);

  console.log("✅ Đã tạo", file);
})();