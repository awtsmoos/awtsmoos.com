// B"H
/**
 * @file dosdb_parallel_awtsmoosdb_test.js
 * @chapter The Twin Vessel Bridge
 * @description
 * Proves the legacy filesystem DosDB can summon a parallel AwtsmoosDB instance
 * for AI search/vector work without disturbing existing DosDB records.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const DosDB = require('../../../index.js');

const ROOT = path.join(__dirname, 'parallel_bridge_root');
const STATIC_DB = path.join(__dirname, 'parallel_static.awtsdb');

function rm(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

function main() {
  rm(ROOT);
  rm(STATIC_DB);

  assert.strictEqual(typeof DosDB.awtsmoosDb, 'function', 'static DosDB.awtsmoosDb missing');
  assert.strictEqual(typeof DosDB.createAwtsmoosDb, 'function', 'static alias missing');
  assert.strictEqual(typeof DosDB.AwtsmoosDB, 'function', 'AwtsmoosDB class export missing');

  const staticDb = DosDB.awtsmoosDb(STATIC_DB, { debug: false });
  staticDb.root.kind = 'static-parallel';
  staticDb.root.search = { ready: true, terms: ['ai', 'torah', 'comments'] };
  staticDb.waitForIdle();
  assert.strictEqual(staticDb.root.kind, 'static-parallel');
  assert.strictEqual(staticDb.root.search.ready, true);
  staticDb.close();

  fs.mkdirSync(ROOT, { recursive: true });
  const dos = new DosDB(ROOT);
  assert.strictEqual(typeof dos.awtsmoosDb, 'function', 'instance awtsmoosDb missing');

  const instanceDb = dos.awtsmoosDb('ai-search.awtsdb', { attachOwner: true });
  instanceDb.root.commentIndex = {
    alias: 'tester',
    section: 7,
    vectorReady: true
  };
  instanceDb.waitForIdle();

  assert.strictEqual(instanceDb.dosdb, dos, 'attachOwner did not link owner invisibly');
  assert.strictEqual(instanceDb.root.commentIndex.vectorReady, true);
  assert.ok(fs.existsSync(path.join(ROOT, 'ai-search.awtsdb')), 'relative instance path did not resolve inside DosDB root');
  instanceDb.close();

  const reopened = dos.awtsmoosDb('ai-search.awtsdb');
  assert.strictEqual(reopened.root.commentIndex.alias, 'tester');
  assert.strictEqual(reopened.root.commentIndex.section, 7);
  reopened.close();

  rm(ROOT);
  rm(STATIC_DB);
  console.log('B"H dosdb_parallel_awtsmoosdb_test passed');
}

try {
  main();
} catch (err) {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
}
