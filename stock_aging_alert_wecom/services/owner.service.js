const path = require("path");
const fs = require("fs");

const OWNERS_FILE = path.join(__dirname, "../config/owners.json");

/** Bỏ dấu + hoa/thường + khoảng trắng thừa để so khớp cust_name ổn định */
function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function loadOwnerConfig(file = OWNERS_FILE) {
  const cfg = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!cfg.default || !Array.isArray(cfg.default.userIds)) {
    throw new Error("owners.json: thiếu 'default.userIds'");
  }
  return cfg;
}

/** Trả về rule đầu tiên khớp cust_name, không có thì trả default */
function resolveOwner(custName, cfg) {
  const name = normalize(custName);
  for (const rule of cfg.rules || []) {
    if ((rule.match || []).some((m) => name.includes(normalize(m)))) {
      return { key: rule.name, name: rule.name, userIds: rule.userIds, isDefault: false };
    }
  }
  return { key: cfg.default.name, name: cfg.default.name, userIds: cfg.default.userIds, isDefault: true };
}

/**
 * Gom theo NHÓM khách (tên rule trong owners.json; khách không khớp rule nào -> nhóm default, vd "Other").
 * Thứ tự: theo thứ tự rules, nhóm default luôn đứng cuối. Chỉ trả nhóm có dữ liệu.
 */
function groupByOwnerGroup(rows, cfg) {
  const map = new Map();
  for (const row of rows) {
    const owner = resolveOwner(row.cust_name, cfg);
    if (!map.has(owner.key)) map.set(owner.key, { name: owner.name, owner, rows: [] });
    map.get(owner.key).rows.push(row);
  }
  const order = [...(cfg.rules || []).map((r) => r.name), cfg.default.name];
  return [...map.values()].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
}

module.exports = { normalize, loadOwnerConfig, resolveOwner, groupByOwnerGroup };