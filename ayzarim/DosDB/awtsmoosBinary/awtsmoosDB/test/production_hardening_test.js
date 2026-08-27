// B"H

/**
 * @file production_hardening_test.js
 * @chapter The Door, The Ledger, And The Verified Mirror
 * @description Process locks, durable recovery, persistent schemas, auto indexes.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

module.exports = (() => {
  const dbPath = TempDbPath.make('production_hardening');
  const backupDir = `${dbPath}.backup`;
  TempDbPath.remove(dbPath);
  fs.rmSync(backupDir, { recursive: true, force: true });

  let db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: false });
  db.open();
  db.root.items = { a: { color: 'red' }, b: { color: 'blue' } };
  db.indexes.create('root.items', 'color', { name: 'auto_color' });
  db.root.items.c = { color: 'red' };
  assert(db.indexes.find('auto_color', 'red').length === 2, 'index auto rebuilds on insert');
  delete db.root.items.a;
  assert(db.indexes.find('auto_color', 'red').length === 1, 'index auto rebuilds on delete');
  db.schema.define('root.persisted', { type: 'object', props: { n: { type: 'number' } } });
  db.root.persisted = { n: 7 };
  db.backup(backupDir);
  assert(db.backups.verifyManifest(backupDir).ok === true, 'backup manifest verifies');

  const lockChild = spawnSync(process.execPath, ['-e', lockScript(dbPath)], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
  assert(lockChild.status === 77, `second process/open is refused while locked: ${lockChild.stderr}`);
  db.close();

  db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: false });
  db.open();
  let denied = false;
  try { db.root.persisted = { n: 'bad' }; } catch (_err) { denied = true; }
  assert(denied, 'schema rules reload from database');
  db.close();

  const child = spawnSync(process.execPath, ['-e', crashScript(dbPath)], {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8'
  });
  assert(child.status === 91, `child crash harness exited ${child.status}: ${child.stderr}`);

  db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: false });
  db.open();
  assert(db.root.crash.value === 1, 'active transaction journal recovers previous value');
  db.close();

  TempDbPath.remove(dbPath);
  fs.rmSync(backupDir, { recursive: true, force: true });
  console.log('B"H production_hardening_test PASS');
})();

function crashScript(dbPath) {
  return `
    const AwtsmoosDB = require(${JSON.stringify(path.join(__dirname, '..', 'index.js'))});
    const db = new AwtsmoosDB(${JSON.stringify(dbPath)}, { compression: true, turboWrites: false });
    db.open();
    db.root.crash = { value: 1 };
    db.waitForIdle({ closing: false });
    db.transactions.journal.begin(db._plain(db.root));
    db.root.crash = { value: 2 };
    db.waitForIdle({ closing: false });
    process.exit(91);
  `;
}

function lockScript(dbPath) {
  return `
    const AwtsmoosDB = require(${JSON.stringify(path.join(__dirname, '..', 'index.js'))});
    try {
      const db = new AwtsmoosDB(${JSON.stringify(dbPath)}, { processLock: true });
      db.open();
      process.exit(76);
    } catch (_err) {
      process.exit(77);
    }
  `;
}
