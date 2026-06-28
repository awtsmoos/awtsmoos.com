// B"H
const fs = require('fs');
const path = require('path');
const { MODULE_SUFFIXES, roots, dbFile } = require('./paths.js');
function modulePath(config = {}) {
  const tried = [];
  for (const root of roots(config)) for (const suffix of MODULE_SUFFIXES) {
    const candidate = path.join(root, suffix); tried.push(candidate);
    if (fs.existsSync(candidate)) return candidate;
  }
  const err = new Error('awtsmoosdb_module_missing: ' + tried.join(' | '));
  err.code = 'AWTSMOOSDB_MODULE_MISSING';
  throw err;
}
function open(config = {}, kind = 'actions', options = {}) {
  fs.mkdirSync(path.dirname(dbFile(config, kind)), { recursive: true });
  const AwtsmoosDB = require(modulePath(config));
  const db = new AwtsmoosDB(dbFile(config, kind), { debug: false, ...options });
  db.open();
  return db;
}
function withDb(config, kind, fn, options = {}) {
  const db = open(config, kind, options);
  try { return fn(db); } finally { db.close(); }
}
module.exports = { modulePath, open, withDb, dbFile };
