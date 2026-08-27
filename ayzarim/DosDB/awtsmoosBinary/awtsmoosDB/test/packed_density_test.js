// B\"H

/**
 * @file test/packed_density_test.js
 * @chapter The Bytes That Wanted Not To Be Wasted
 * @description
 * Density regressions for tiny packed objects and packed-rewrite mutations.
 */

const fs = require('fs');
const assert = require('assert');
const AwtsmoosDB = require('../index.js');
const Codec = require('../api/packed/objectCodec.js');

const dbPath = __dirname + '/__packed_density_test.awtsdb';

function clean() {
  for (const suffix of ['', '.wal', '.lock', '.txn.json', '.sparse.json']) {
    try { fs.rmSync(dbPath + suffix, { force: true }); } catch (_err) {}
  }
}

clean();
const db = new AwtsmoosDB(dbPath, { wal: false });
db.open();

// 1. Empty object is zero payload bytes: the pointer type already carries meaning.
const empty = Codec.tryEncodePlain({}, db.builder.scribe);
assert(Buffer.isBuffer(empty), 'empty object must encode as a packed buffer');
assert.strictEqual(empty.length, 0, 'empty object packet must waste zero payload bytes');

// 2. New tiny header should be smaller than the legacy APOB header tax.
const one = Codec.tryEncodePlain({ a: 1 }, db.builder.scribe);
assert(one.length <= 5, 'single-field object should be at most 5 bytes with compact scalars');
assert.deepStrictEqual(Codec.decode(one, { db, allocator: db.allocator }), { a: 1 });

// 3. Get must be lazy-capable: a single-key lookup does not need materialization of all keys.
const trinity = Codec.tryEncodePlain({ a: 1, b: 2, c: 3 }, db.builder.scribe);
assert.strictEqual(Codec.get(trinity, 'b', { db, allocator: db.allocator }).value, 2);
assert.deepStrictEqual(Codec.keys(trinity), ['a', 'b', 'c']);

// 4. Small mutations must stay publicly correct and persistent after close/reopen.
db.root.seed = { a: 1 };
db.root.seed.b = true;
assert.deepStrictEqual(db.root.seed.__resolve__(), { a: 1, b: true });

db.root.limited = { a: 1 };
for (let i = 0; i < 12; i++) db.root.limited['k' + i] = i;
assert.strictEqual(db.root.limited.k11, 11);

db.close();

const reopened = new AwtsmoosDB(dbPath, { wal: false });
reopened.open();
assert.deepStrictEqual(reopened.root.seed.__resolve__(), { a: 1, b: true });
assert.strictEqual(reopened.root.limited.k11, 11);
reopened.close();
clean();

console.log('B\"H packed_density_test PASS');
