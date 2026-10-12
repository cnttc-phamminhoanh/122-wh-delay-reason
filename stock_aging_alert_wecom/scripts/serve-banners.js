// Server tĩnh nhỏ để WeCom tải banner: http://<IP-server>:3010/banner_red.png
// Chạy: npm run serve-banners  (nên chạy nền bằng pm2/systemd). Hoặc tự upload assets/*.png lên web server bất kỳ.
const http = require("http");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "../assets");
const port = Number(process.env.BANNER_PORT || 3010);

http
  .createServer((req, res) => {
    const name = path.basename(req.url.split("?")[0]);
    const file = path.join(dir, name);
    if (!/^banner_(red|yellow)\.png$/.test(name) || !fs.existsSync(file)) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Banner server: http://0.0.0.0:${port}/banner_red.png`));
