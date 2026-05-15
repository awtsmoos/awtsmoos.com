// B"H

/**
 * @file wal_recovery_test.js
 * @chapter The Interrupted Flush Returns
 * @description Simulates a crash after WAL was written but before DB bytes were
 * applied, then verifies open-time recovery.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const fs = require('fs');
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

const dbPath = TempDbPath.make('wal_recovery');
TempDbPath.remove(dbPath);

let db = new AwtsmoosDB(dbPath, { compression: false });
db.open();
db.root.before = 'stable';
db.close();

db = new AwtsmoosDB(dbPath, { compression: false });
db.open();
db.root.after = 'from wal';
db.pager._flushWal();

const dirtySize = db.pager.logicalSize();
const fd = fs.openSync(dbPath, 'r+');
try {
  fs.ftruncateSync(fd, Math.max(64, dirtySize - 16));
} finally {
  fs.closeSync(fd);
}

try {
  db.pager.fd && fs.closeSync(db.pager.fd);
} catch (_err) {}

db.pager.fd = null;
db.pager.pages.clear();
db.pager.initialized = false;

db = new AwtsmoosDB(dbPath, { compression: false });
db.open();

assert(db.root.before === 'stable', 'pre-crash value should remain');
assert(db.root.after === 'from wal', 'wal value should recover');
assert(!fs.existsSync(`${dbPath}.wal`) || fs.statSync(`${dbPath}.wal`).size === 0, 'wal should be cleared after recovery');

db.close();
TempDbPath.remove(dbPath);

console.log('B"H wal_recovery_test PASS');
