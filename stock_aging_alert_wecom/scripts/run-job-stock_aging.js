const path = require("path");
const fs = require("fs/promises");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });

const { createReportFile } = require("../utils/report-file.util");
const { generateWorkbook } = require("../services/excel.service");
const { closePool } = require("../services/sql.service");
const { loadOwnerConfig, groupByOwnerGroup } = require("../services/owner.service");
const S = require("../services/stock-aging.service");
const wecom = require("../services/wecom.service");

const STATE_FILE = path.join(__dirname, "../data/stock_aging_state.json");
const readState = async () => {
  try { return JSON.parse(await fs.readFile(STATE_FILE, "utf8")); } catch { return {}; }
};
const writeState = async (state) => {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
};

const log = (job, msg) => console.log(`[${new Date().toISOString()}] [JOB] ${job}: ${msg}`);

(async () => {
  const jobName = process.argv[2] || "stock_aging";
  const dryRun = process.argv.includes("--dry-run") || String(process.env.DRY_RUN).toLowerCase() === "true";

  try {
    log(jobName, `=== START ${dryRun ? "(DRY RUN)" : ""} ===`);
    const rules = S.getRules();
    const ownerCfg = loadOwnerConfig();
    const allRows = await S.fetchAgedStock(rules);

    // Lần đầu gửi tất cả; từ lần 2 chỉ gửi mã có ngày tồn = 90, 180, 270, ...
    const state = await readState();
    const firstRun = !state.firstRunDone || String(process.env.STOCK_FORCE_ALL).toLowerCase() === "true";
    const rows = S.selectForRun(allRows, rules, firstRun);
    log(jobName, `${firstRun ? "FIRST RUN: send all" : `milestone only (every ${rules.stepDays} days)`} -> ${rows.length}/${allRows.length} rows`);

    if (rows.length === 0) {
      log(jobName, "Nothing to send today.");
      if (!dryRun && firstRun) await writeState({ firstRunDone: true, firstRunAt: new Date().toISOString() });
      return;
    }

    // Nhóm: Carter's / Haddad / Next / ... / Other (chỉ nhóm có dữ liệu)
    const groups = groupByOwnerGroup(rows, ownerCfg);
    log(jobName, `${rows.length} rows -> groups: ${groups.map((g) => `${g.name}(${g.rows.length})`).join(", ")}`);

    // 1) Thẻ tổng hợp
    const cards = S.buildSummaryCards(groups);
    for (const card of cards) {
      if (dryRun) log(jobName, `[DRY] card\n${JSON.stringify(card, null, 2)}`);
      else await wecom.sendTemplateCard(card);
    }

    // 2) 1 file Excel, 1 sheet: stock_aging_<YYYYMMDD>.xlsx (có cột Buyer = cust_name)
    const sheets = [{
      name: "Stock Aging",
      reportTitle: "Stock Aging",
      data: S.toExcelRows(S.sortForExcel(groups, rows)),
    }];

    const filePath = createReportFile("stock_aging", { dateOnly: true });
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await generateWorkbook(sheets, filePath);

    if (dryRun) {
      log(jobName, `[DRY] file ${filePath} (${sheets[0].data.length} lots, 1 sheet)`);
    } else {
      await wecom.sendFile(await wecom.uploadFile(filePath));
      await fs.unlink(filePath);
    }

    // 3) Tin cuối: chỉ @tag người phụ trách
    const tag = S.buildTagMessage(groups);
    if (dryRun) log(jobName, `[DRY] tag message\n${tag}`);
    else await wecom.sendMarkdown(tag);

    if (!dryRun && firstRun) await writeState({ firstRunDone: true, firstRunAt: new Date().toISOString() });
    log(jobName, "=== COMPLETED ===");
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [JOB] ${jobName} === FAILED ===`, err);
    process.exitCode = 1;
  } finally {
    await closePool();
  }
})();