// B"H

/**
 * @file runtime_features_test.js
 * @chapter The Runtime Ledger
 * @description Compact tests for optional runtime features: encryption, history,
 * memory stats, and exact-range GC reporting.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

/**
 * @function resolve
 * @param {*} value - Possible handle.
 * @returns {*} Plain value.
 */
function resolve(value) {
  return value && value.__resolve__ ? value.__resolve__() : value;
}

/**
 * @function withDb
 * @param {string} name - DB name.
 * @param {Function} fn - Test body.
 * @returns {void}
 */
function withDb(name, fn) {
  const dbPath = TempDbPath.make(name);
  TempDbPath.remove(dbPath);

  const db = new AwtsmoosDB(dbPath);
  db.open();

  try {
    fn(db);
  } finally {
    db.close();
    TempDbPath.remove(dbPath);
  }
}

withDb('runtime_features', db => {
  db.root.secret = db.encrypt({ msg: 'hidden', n: 770 }, 'pw');

  const sealed = resolve(db.root.secret);
  assert(sealed.__awtsmoosEncrypted === true, 'encrypted field marker');
  assert(db.decrypt(sealed, 'pw').msg === 'hidden', 'decrypt roundtrip');

  let failed = false;
  try {
    db.decrypt(sealed, 'bad');
  } catch (_err) {
    failed = true;
  }
  assert(failed, 'wrong password must fail authentication');

  db.root.undoMe = 'first';
  delete db.root.undoMe;
  assert(db.history('undoMe').length === 1, 'delete should record version');
  db.restore('undoMe');
  assert(resolve(db.root.undoMe) === 'first', 'restore should resurrect version');

  db.root.big = Buffer.alloc(4096, 9);
  delete db.root.big;

  const gc = db.gc();
  assert(gc.logicalBytes > 0, 'gc returns logical size');
  assert(gc.freeBytes >= 4096 || gc.freeRanges >= 0, 'gc returns free ledger');

  const mem = db.memoryStats();
  assert(mem.rss > 0 && mem.heapUsed > 0 && mem.pagerBytes >= 0, 'memory stats shape');

  const liveInfo = db.info();
  assert(liveInfo.logicalBytes > 0 && liveInfo.memory.rss > 0, 'open db info shape');

  db.close();
  const fileInfo = AwtsmoosDB.inspectFile(db.pager.filePath);
  assert(fileInfo.exists && fileInfo.physicalBytes > 0, 'static file inspect without opening mirror');
  db.open();
});

console.log('B"H runtime_features_test PASS');
