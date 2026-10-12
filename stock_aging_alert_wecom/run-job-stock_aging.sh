#!/usr/bin/env bash
# Chạy hằng ngày 9h30 AM
set -euo pipefail

PROJECT_DIR="/home/it/122-wh-daylay-reason/stock_aging_alert_wecom"
LOG_DIR="${PROJECT_DIR}/logs"
LOG_FILE="${LOG_DIR}/stock_aging.log"
NODE_BIN="/home/it/.nvm/versions/node/v22.18.0/bin/node"
JOB_FILE="${PROJECT_DIR}/scripts/run-job-stock_aging.js"


mkdir -p "${LOG_DIR}"
cd "${PROJECT_DIR}" || exit 1

"${NODE_BIN}" "${JOB_FILE}" >> "${LOG_FILE}" 2>&1
