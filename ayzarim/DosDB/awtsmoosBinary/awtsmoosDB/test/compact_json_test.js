// B"H

/**
 * @file test/compact_json_test.js
 * @chapter The Sealed Scroll Regression
 * @description
 * Proves legacy AwtsmoosBinaryJSON can live inside the DB as exact raw bytes
 * behind a binary token, without becoming a JSON-string token or expanded tree.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const AwtsmoosDB = require('../index.js');
const legacy = require('../../awtsmoosBinaryJSON/index.js');

const dbPath = path.join(__dirname, '__compact_json_test.awtsdb');

for (const suffix of ['', '.wal', '.sparse.json', '.lock', '.txn.json']) {
  try { fs.rmSync(dbPath + suffix, { force: true }); } catch (_err) {}
}

const source = {
  title: 'B"H compact',
  count: 7,
  nested: {
    name: 'inner',
    active: true
  }
};

const raw = legacy.serializeJSON(source);
assert(raw.length > 0 && raw.length < 4096, 'legacy compact fixture should be small');

let db = new AwtsmoosDB(dbPath, {
  wal: false,
  compression: false,
  maxCachedPages: 16,
  dirtyPageFlushThreshold: 8
});
db.open();

const token = db.compactJson.fromRaw(raw, { test: 1 });
assert.strictEqual(token.__awtsmoosCompactJson, true);
assert.strictEqual(token.length, raw.length);

db.root.compact = token;
db.close();

db = new AwtsmoosDB(dbPath, {
  wal: false,
  compression: false,
  maxCachedPages: 16,
  dirtyPageFlushThreshold: 8
});
db.open();

const compact = db.root.compact;
assert(compact && compact.__awtsmoosCompactJsonRef === true, 'read should hydrate compact ref');
assert.strictEqual(compact.get('title'), source.title);
assert.strictEqual(compact.get('count'), source.count);
assert.deepStrictEqual(compact.materialize(), source);

const keys = compact.keys().sort();
assert.deepStrictEqual(keys, ['count', 'nested', 'title']);

const info = db.storageStats();
assert(info.logicalBytes < 4096 * 4, 'small compact document should not explode into a large block structure');

db.close();

for (const suffix of ['', '.wal', '.sparse.json', '.lock', '.txn.json']) {
  try { fs.rmSync(dbPath + suffix, { force: true }); } catch (_err) {}
}

console.log('B"H compact JSON binary-token test passed');
