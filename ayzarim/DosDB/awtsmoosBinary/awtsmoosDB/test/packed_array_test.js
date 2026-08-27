// B"H

/**
 * @file test/packed_array_test.js
 * @chapter The Dense Array Seed Regression
 * @description
 * Proves small dense arrays are exact-byte packed vessels that behave like live arrays.
 */

const fs = require('fs');
const assert = require('assert');
const AwtsmoosDB = require('../index.js');
const Codec = require('../api/packed/arrayCodec.js');

const dbPath = __dirname + '/__packed_array_test.awtsdb';

function clean() {
  for (const suffix of ['', '.wal', '.lock', '.txn.json', '.sparse.json']) {
    try { fs.rmSync(dbPath + suffix, { force: true }); } catch (_err) {}
  }
}

clean();

let db = new AwtsmoosDB(dbPath, { wal: false });
db.open();

// 1. Empty dense array costs zero payload bytes.
const empty = Codec.tryEncodeDense([], db.builder.scribe);
assert(Buffer.isBuffer(empty), 'empty array must pack');
assert.strictEqual(empty.length, 0, 'empty array packet must waste zero payload bytes');

// 2. Tiny scalar dense array should be brutally small and exact.
const raw = Codec.tryEncodeDense([0, 1, -1, true], db.builder.scribe);
assert(raw && raw.length <= 9, 'tiny scalar array should be very small');
assert.deepStrictEqual(Codec.decode(raw, { db, allocator: db.allocator }), [0, 1, -1, true]);
assert.strictEqual(Codec.get(raw, 2, { db, allocator: db.allocator }).value, -1);
assert.strictEqual(Codec.length(raw), 4);

// 3. Live packed array reads like a normal array.
db.root.arr = [1, 2, 3];
assert.strictEqual(db.root.arr.length, 3);
assert.strictEqual(db.root.arr[0], 1);
assert.strictEqual(db.root.arr[2], 3);
assert.deepStrictEqual([...db.root.arr.keys()], [0, 1, 2]);

// 4. Small set and push stay public-correct and persist.
db.root.arr[1] = 7;
assert.strictEqual(db.root.arr[1], 7);
assert.strictEqual(db.root.arr.push(8), 4);
assert.strictEqual(db.root.arr.length, 4);
assert.deepStrictEqual(db.root.arr.__resolve__(), [1, 7, 3, 8]);

// 5. Outgrowth still works by promotion instead of failing.
db.root.grow = [];
for (let i = 0; i < 20; i++) db.root.grow.push(i);
assert.strictEqual(db.root.grow.length, 20);
assert.strictEqual(db.root.grow[19], 19);

db.close();

db = new AwtsmoosDB(dbPath, { wal: false });
db.open();
assert.deepStrictEqual(db.root.arr.__resolve__(), [1, 7, 3, 8]);
assert.strictEqual(db.root.grow[19], 19);
db.close();

clean();

console.log('B"H packed_array_test PASS');
