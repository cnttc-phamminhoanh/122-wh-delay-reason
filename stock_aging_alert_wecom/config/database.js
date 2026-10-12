// Đọc theo .env: DB_TYPE, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE
// (vẫn nhận DB_SERVER cũ nếu không có DB_HOST). Query dùng cú pháp SQL Server (DATEDIFF/GETDATE)
// nên DB_TYPE chỉ hỗ trợ mssql.
const type = String(process.env.DB_TYPE || "mssql").toLowerCase();

if (!["mssql", "sqlserver"].includes(type)) {
  throw new Error(`DB_TYPE="${process.env.DB_TYPE}" không được hỗ trợ. Dự án này dùng SQL Server (mssql).`);
}

const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

module.exports = {
  server: process.env.DB_HOST || process.env.DB_SERVER,
  ...(port ? { port } : {}),
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};
