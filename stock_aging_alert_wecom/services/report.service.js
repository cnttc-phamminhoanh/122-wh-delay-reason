const { getPool, sql } = require("./sql.service");

/**
 * @param {string} query
 * @param {Array<{name:string,type:any,value:any}>} params  tham số @name
 */
async function executeQuery(query, params = []) {
  const pool = await getPool();
  const request = pool.request();
  params.forEach((p) => request.input(p.name, p.type, p.value));
  const result = await request.query(query);
  return result.recordset;
}

module.exports = { executeQuery, sql };
