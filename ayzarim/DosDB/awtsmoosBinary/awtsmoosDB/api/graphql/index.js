// B"H

/**
 * @file api/graphql/index.js
 * @chapter Queries Wearing Fire
 * @description GraphQL facade over the same table API used by SQL.
 */

const { lex } = require('./lexer.js');
const { Parser } = require('./parser.js');

function createGraphQLApi(db) {
  const api = (source) => api.query(source);
  api.parse = (source) => new Parser(lex(source)).parse();
  api.query = (source) => execute(db, api.parse(source));
  return api;
}

function execute(db, ast) {
  const data = {};
  for (const field of ast.fields) data[field.name] = runField(db, field);
  return { data };
}

function runField(db, field) {
  const tableName = field.args.table || field.name;
  const table = db.table(tableName);
  if (field.op === 'mutation' || field.name.startsWith('insert')) {
    const row = field.args.row || stripMeta(field.args);
    return project(table.insert(row).row, field.select);
  }
  if (field.name.startsWith('update')) {
    return table.update(field.args.where || null, field.args.set || {});
  }
  if (field.name.startsWith('delete')) {
    return table.delete(field.args.where || null);
  }
  const rows = table.select({
    columns: field.select.length ? field.select : ['*'],
    where: normalizeWhere(field.args.where || null),
    limit: field.args.limit,
    offset: field.args.offset || 0,
    order: field.args.order || null
  });
  return rows;
}

function normalizeWhere(where) {
  if (!where || where.key) return where;
  const key = Object.keys(where)[0];
  return key ? { key, op: '=', value: where[key] } : null;
}

function stripMeta(args) {
  const out = { ...args };
  delete out.table;
  return out;
}

function project(row, fields) {
  if (!fields || !fields.length) return row;
  return Object.fromEntries(fields.map((key) => [key, row[key]]));
}

module.exports = createGraphQLApi;
