// B"H

/**
 * @file production_features_test.js
 * @chapter The House With Locks, Mirrors, Ledgers, And Return
 * @description Exercises production shell features without weakening the core.
 */

const fs = require('fs');
const path = require('path');
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

module.exports = (() => {
  const dbPath = TempDbPath.make('production_features');
  const partial = `${dbPath}.partial.json`;
  const fullDir = `${dbPath}.backup`;
  const replicaDir = `${dbPath}.replica`;
  TempDbPath.remove(dbPath);
  fs.rmSync(fullDir, { recursive: true, force: true });
  fs.rmSync(replicaDir, { recursive: true, force: true });

  const db = new AwtsmoosDB(dbPath, { compression: true, turboWrites: false });
  db.open();

  db.schema.define('root.users.u1', { type: 'object', props: { age: { type: 'number' } } });
  db.schema.allow('root.secure', ({ value }) => !value || value.ok === true);
  db.root.users = {};
  db.root.users.u1 = { age: 36, name: 'A' };

  let denied = false;
  try { db.root.users.u1 = { age: 'old' }; } catch (_err) { denied = true; }
  assert(denied, 'schema rejects wrong type');

  denied = false;
  try { db.root.secure = { ok: false }; } catch (_err) { denied = true; }
  assert(denied, 'permission rule rejects write');

  db.root.secure = { ok: true };
  db.root.items = {
    a: { color: 'red', score: 1 },
    b: { color: 'blue', score: 2 },
    c: { color: 'red', score: 3 }
  };
  const index = db.indexes.create('root.items', 'color', { name: 'items_color' });
  assert(index.keys === 3, 'secondary index sees rows');
  assert(db.indexes.find('items_color', 'red').length === 2, 'secondary index exact match');

  const tx = db.transaction(() => {
    db.root.users.u2 = { age: 5 };
    throw new Error('rollback me');
  });
  assert(tx.ok === false, 'transaction reports rollback');
  assert(db.root.users.u2 === undefined, 'transaction rollback restores root');

  const partialStats = db.backup(partial, { paths: ['root.users', 'root.secure'] });
  assert(partialStats.entries === 2 && fs.existsSync(partial), 'partial backup written');
  const fullStats = db.backup(fullDir);
  assert(fullStats.files >= 1 && fs.existsSync(path.join(fullDir, path.basename(dbPath))), 'full backup copied');
  db.replication.add(replicaDir);
  assert(db.replication.sync()[0].ok === true, 'replica sync uses backup');

  const report = db.admin.report();
  assert(report.verifyOk === true && report.logicalBytes > 0, 'admin report verifies database');
  assert(db.admin.list(db.root.items, { limit: 2 }).length === 2, 'admin paged listing');

  delete db.root.users;
  db.restoreBackup(partial);
  assert(db.root.users.u1.age === 36 && db.root.secure.ok === true, 'partial restore works');

  db.close();
  TempDbPath.remove(dbPath);
  fs.rmSync(partial, { force: true });
  fs.rmSync(fullDir, { recursive: true, force: true });
  fs.rmSync(replicaDir, { recursive: true, force: true });

  console.log('B"H production_features_test PASS');
})();
