// B"H

/**
 * @file gc_verify_test.js
 * @chapter The Sweep After The Silence
 * @description Verifies mark/sweep range collection, persistent free-list
 * metadata, and verified reuse mode.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

const dbPath = TempDbPath.make('gc_verify');
TempDbPath.remove(dbPath);

let db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: false });
db.open();

db.root.keep = Buffer.alloc(2048, 1);
db.root.gone = Buffer.alloc(4096, 2);
db.root.nested = { a: 'alive', b: [1, 2, 3] };
delete db.root.gone;

let report = db.verify();
assert(report.ok, `verify should pass before gc: ${JSON.stringify(report.errors)}`);
assert(report.freeBytes >= 4096, `verify should discover free bytes, got ${report.freeBytes}`);

const gc = db.gc();
assert(gc.ok, 'gc should be based on clean verify');
assert(gc.freeBytes >= 4096, `gc should install free bytes, got ${gc.freeBytes}`);

db.close();

db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
db.open();

assert(db.allocator.freeList.length > 0, 'free-list should persist across reopen');

const before = db.storageStats().logicalBytes;
db.root.reuse = Buffer.alloc(2048, 3);
const after = db.storageStats().logicalBytes;

assert(after - before < 1024, `verified reuse should avoid append growth, grew ${after - before}`);
assert(db.root.keep.length === 2048, 'live value survives gc');
assert(db.root.nested.a === 'alive', 'nested value survives gc');

report = db.verify();
assert(report.ok, `verify should pass after reuse: ${JSON.stringify(report.errors)}`);

db.close();
TempDbPath.remove(dbPath);

console.log('B"H gc_verify_test PASS');
