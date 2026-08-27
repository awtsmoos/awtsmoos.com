// B\"H

/**
 * @file test/packed_object_test.js
 * @chapter The Seed House Regression
 * @description
 * Proves small plain objects can be stored as one packed binary scalar,
 * heavy dictionary machinery is deferred, and first mutation promotes it
 * without breaking live-handle behavior.
 */

const fs = require('fs');
const assert = require('assert');
const AwtsmoosDB = require('../index.js');
const Codec = require('../api/packed/objectCodec.js');

const dbPath = __dirname + '/__packed_object_test.awtsdb';

function clean() {
  for (const suffix of ['', '.wal', '.lock', '.txn.json', '.sparse.json']) {
    try { fs.rmSync(dbPath + suffix, { force: true }); } catch (_err) {}
  }
}

clean();

let db = new AwtsmoosDB(dbPath, { wal: false });
db.open();

const raw = Codec.tryEncodePlain({ a: 1, b: true, c: 'shi' }, db.builder.scribe);
assert(raw && raw.length < 64, 'tiny plain object should encode to one small packed packet');
assert.deepStrictEqual(Codec.decode(raw, { db, allocator: db.allocator }), { a: 1, b: true, c: 'shi' });

db.root.small = { id: 1, name: 'shi' };
assert.strictEqual(db.root.small.id, 1);
assert.strictEqual(db.root.small.name, 'shi');

db.root.small.extra = 7;
assert.strictEqual(db.root.small.extra, 7);
assert.strictEqual(db.root.small.id, 1);

db.root.abyss = {};
let cur = db.root.abyss;
for (let i = 0; i < 12; i++) {
  cur['level_' + i] = { id: i };
  cur = cur['level_' + i];
}
let read = db.root.abyss;
for (let i = 0; i < 12; i++) {
  read = read['level_' + i];
  assert.strictEqual(read.id, i);
}

db.close();

db = new AwtsmoosDB(dbPath, { wal: false });
db.open();
assert.strictEqual(db.root.small.extra, 7);
assert.strictEqual(db.root.small.name, 'shi');
db.close();

clean();

console.log('B\"H packed_object_test PASS');
