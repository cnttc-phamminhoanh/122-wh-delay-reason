const sharp = require("sharp");

const W = 1400;
const H = 600;

const THEMES = {
  red: {
    from: "#FB7185",
    to: "#DC2626",
    ink: "#FFFFFF",
    title: "Please check the inventory",
    sub: "122 - 保留仓 - Reserve Materials WH",
  },
};

const FONT = process.env.CARD_FONT || "Arial, sans-serif";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function bannerSvg() {
  const theme = THEMES.red;
  const title = escapeXml(theme.title);
  const subtitle = escapeXml(theme.sub);
  const font = escapeXml(FONT);

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.from}"/>
      <stop offset="100%" stop-color="${theme.to}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#background)"/>

  <!-- Decorative circles -->
  <circle cx="1250" cy="110" r="260" fill="#FFFFFF" fill-opacity="0.12"/>
  <circle cx="1340" cy="560" r="170" fill="#FFFFFF" fill-opacity="0.10"/>
  <circle cx="150" cy="640" r="150" fill="#000000" fill-opacity="0.06"/>

  <!-- Title - căn giữa, chữ to -->
  <text
    x="700"
    y="250"
    font-family="${font}"
    font-size="100"
    font-weight="800"
    fill="${theme.ink}"
    text-anchor="middle"
    dominant-baseline="middle"
  >${title}</text>

  <!-- Subtitle - căn giữa -->
  <text
    x="700"
    y="360"
    font-family="${font}"
    font-size="60"
    font-weight="600"
    fill="${theme.ink}"
    fill-opacity="0.95"
    text-anchor="middle"
    dominant-baseline="middle"
  >${subtitle}</text>
</svg>`.trim();
}

async function renderBannerPng() {
  const svg = bannerSvg();
  const input = Buffer.from(svg, "utf8");

  const image = sharp(input, { density: 144, failOn: "error" });
  const pngBuffer = await image.png({ compressionLevel: 9 }).toBuffer();

  if (!pngBuffer || pngBuffer.length === 0) {
    throw new Error("Sharp returned an empty PNG buffer.");
  }
  return pngBuffer;
}

async function saveBanner(outputPath) {
  if (!outputPath) throw new Error("outputPath is required.");
  const pngBuffer = await renderBannerPng();
  await require("fs").promises.writeFile(outputPath, pngBuffer);
  return outputPath;
}

module.exports = { W, H, THEMES, bannerSvg, renderBannerPng, saveBanner };