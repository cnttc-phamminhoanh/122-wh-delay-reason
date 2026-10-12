#!/usr/bin/env bash
# Chạy hằng ngày 9h30 AM
set -euo pipefail

PROJECT_DIR="/home/it/stock_aging_alert_wecom"
LOG_DIR="${PROJECT_DIR}/logs"
NODE_BIN="/home/it/.nvm/versions/node/v22.18.0/bin/node"

mkdir -p "${LOG_DIR}"
cd "${PROJECT_DIR}"

"${NODE_BIN}" scripts/run-job-stock_aging.js stock_aging >> "${LOG_DIR}/stock_aging.log" 2>&1