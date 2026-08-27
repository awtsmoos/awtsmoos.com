// B"H

/**
 * @file api/sql/index.js
 * @chapter The Speaking Table
 * @description Callable SQL facade with ?? parameters and PostgreSQL helpers.
 */

const { lex } = require('./lexer.js');
const { Parser } = require('./parser.js');
const { SQLExecutor } = require('./executor.js');

/**
 * @function createSQLApi
 * @param {object} db - Database.
 * @returns {Function} Callable SQL API.
 */
function createSQLApi(db) {
  const executor = new SQLExecutor(db);
  const api = (sql, params = []) => api.query(sql, params);

  api.parse = (sql) => new Parser(lex(sql)).parse();
  api.query = (sql, params = []) => executor.run(api.parse(sql), params);
  api.run = api.query;
  api.postgres = (sql, params = []) => api.query(convertPostgres(sql), params);

  return api;
}

/**
 * @function convertPostgres
 * @description Converts $1-style params into Awtsmoos ?? params.
 * @param {string} sql - PostgreSQL-ish SQL.
 * @returns {string} Awtsmoos SQL.
 */
function convertPostgres(sql) {
  return String(sql || '').replace(/\$\d+/g, '??').replace(/\bRETURNING\b[\s\S]*$/i, '');
}

module.exports = createSQLApi;
