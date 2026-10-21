const stockAgingQuery = require("../reports/stock_aging.report");
const { executeQuery, sql } = require("./report.service");

const num = (v) => Number(v) || 0;

function getRules() {
  return {
    stNo: process.env.STOCK_ST_NO || "122",
    yellowDays: Number(process.env.STOCK_YELLOW_DAYS || 90),
    redDays: Number(process.env.STOCK_RED_DAYS || 180),
    stepDays: Number(process.env.STOCK_STEP_DAYS || 90), // mốc lặp: 90, 180, 270, ...
  };
}

// Ngày tồn đúng bằng bội số của stepDays (90, 180, 270, ...) 
const isMilestone = (ageDays, step) => step > 0 && num(ageDays) > 0 && num(ageDays) % step === 0;

// Lần đầu gửi tất cả; các lần sau chỉ gửi mã có ngày tồn đúng mốc 90/180/270... 
function selectForRun(rows, rules, firstRun) {
  return firstRun ? rows : rows.filter((r) => isMilestone(r.age_days, rules.stepDays));
}

//  LEVELS 
const LEVELS = {
  red: {
    key: "red",
    icon: "",
    sheet: "Red - 6 months+",
    label: "Stock Aged 6 Months or More",
  },
  yellow: {
    key: "yellow",
    icon: "",
    sheet: "Yellow - 3 months+",
    label: "Stock Aged 3 Months or More",
  },
};

const levelOf = (ageDays, rules) =>
  ageDays >= rules.redDays
    ? LEVELS.red
    : ageDays >= rules.yellowDays
      ? LEVELS.yellow
      : null;

//  DATA 
async function fetchAgedStock(rules = getRules()) {
  const rows = await executeQuery(stockAgingQuery, [
    { name: "stNo", type: sql.VarChar(10), value: rules.stNo },
    { name: "minDays", type: sql.Int, value: rules.yellowDays },
  ]);

  return rows
    .map((r) => ({ ...r, level: levelOf(num(r.age_days), rules)?.key }))
    .filter((r) => r.level);
}

function splitByLevel(rows) {
  return {
    red: rows.filter((r) => r.level === "red"),
    yellow: rows.filter((r) => r.level === "yellow"),
  };
}

//  COUNT LOTS 
const lotKey = (r, i) => {
  const lot = String(r.made_lot ?? "").trim();
  return lot ? lot : `#row${i}`;
};

const countLots = (rows) => new Set(rows.map(lotKey)).size;

//  EXCEL 
function toExcelRows(rows) {
  return rows.map((r) => ({
    "Items No": r.goods_no,
    "Items Name": r.goods_name,
    Lot: r.made_lot,
    Unit: r.unit_no,
    Quantity: r.end_qty,
    "PRICE USD": r.end_usd,
    "Cust Style": r.cust_style,
    Buyer: r.cust_name,
    "Stock Days": r.age_days,
    "Delay Reason": r.reason_dl || "",
  }));
}

function sortForExcel(groups, rows) {
  const rank = new Map();
  groups.forEach((g, i) => g.rows.forEach((r) => rank.set(r, i)));

  const levelRank = (r) => (r.level === "red" ? 0 : 1);

  return [...rows].sort(
    (a, b) =>
      levelRank(a) - levelRank(b) ||
      (rank.get(a) ?? 99) - (rank.get(b) ?? 99) ||
      String(a.cust_name ?? "").localeCompare(String(b.cust_name ?? "")) ||
      num(b.age_days) - num(a.age_days)
  );
}

//  WECOM CARD 
const mentions = (owner) => owner.userIds.map((u) => `<@${u}>`).join(" ");

const chunk = (arr, n) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// Ưu tiên Buyer có nhiều Red Lots nhất
function orderForCards(groups) {
  const score = (g) => {
    const by = splitByLevel(g.rows);
    return [countLots(by.red), countLots(by.yellow)];
  };

  return [...groups].sort((a, b) => {
    const [ar, ay] = score(a);
    const [br, by] = score(b);
    return br - ar || by - ay || String(a.name).localeCompare(String(b.name));
  });
}


const ARROWS = {
  red: process.env.STOCK_RED_ARROW || "🔻",
  yellow: process.env.STOCK_YELLOW_ARROW || "🔸",
};


// Nội dung cảnh báo theo Buyer
function groupEntry(group) {
  const by = splitByLevel(group.rows);

  const lines = [LEVELS.red, LEVELS.yellow]
    .map((lv) => ({ level: lv, count: countLots(by[lv.key]) }))
    .filter((x) => x.count > 0)
    .map((x) => `${x.level.label}:\n${ARROWS[x.level.key]} [${x.count}\u00A0Lot]`);

  return { title: group.name, desc: lines.join("\n") };
}

// Tạo Template Cards (tối đa 4 mục / thẻ). aspect_ratio WeCom chỉ nhận 1.3 -> 2.25
function buildSummaryCards(groups) {
  const image = process.env.STOCK_RED_IMAGE;
  const url = process.env.STOCK_CARD_URL;
  const title = process.env.CARD_TITLE || "Send to PMC and Merchandising";

  return chunk(orderForCards(groups), 4).map((part) => ({
    card_type: "news_notice",

    main_title: { title },

    ...(image ? { card_image: { url: image, aspect_ratio: 2.25 } } : {}),

    vertical_content_list: part.map((group) => groupEntry(group)),

    ...(url ? { jump_list: [{ type: 1, title: "Click here to edit", url }] } : {}),

    card_action: {
      type: 1,
      url: url || "https://work.weixin.qq.com",
    },
  }));
}

//  TAG USERS
// Tin cuối: chỉ @tag người phụ trách của các nhóm CÓ dữ liệu (không trùng người)
function buildTagMessage(groups) {
  const ids = [...new Set(groups.flatMap((g) => g.owner.userIds))];
  return ids.map((u) => `<@${u}>`).join(" ");
}

//  EXPORTS 
module.exports = {
  LEVELS,
  getRules,
  isMilestone,
  selectForRun,
  levelOf,
  fetchAgedStock,
  splitByLevel,
  countLots,
  toExcelRows,
  sortForExcel,
  buildSummaryCards,
  buildTagMessage,
  mentions,
};