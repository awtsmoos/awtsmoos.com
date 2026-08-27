// B"H

/**
 * @file blob_fs_test.js
 * @chapter The File System In A Single Vessel
 * @description Tests blob range reads/writes without adding methods to handles.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

const dbPath = TempDbPath.make('blob_fs');
TempDbPath.remove(dbPath);

let db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
db.open();

let blob = db.blob.create(1024, { name: 'disk.img' });
blob = db.blob.write(blob, 100, Buffer.from('HELLO'));
blob = db.blob.write(blob, 900, Buffer.alloc(20, 7));
blob = db.blob.write(blob, 1500, Buffer.from('GROW'));

assert(db.blob.info(blob).length === 1504, 'blob should grow on out-of-range write');
assert(db.blob.read(blob, 100, 5).toString() === 'HELLO', 'offset read should return written text');
assert(db.blob.read(blob, 900, 20).every(b => b === 7), 'binary range should roundtrip');
assert(db.blob.read(blob, 1500, 4).toString() === 'GROW', 'grown range should roundtrip');

db.root.files = { disk: blob };
db.close();

db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
db.open();

blob = db.root.files.disk;
assert(db.blob.read(blob, 100, 5).toString() === 'HELLO', 'persisted blob offset read');

const beforeDelete = db.storageStats().logicalBytes;
db.blob.delete(blob);
delete db.root.files.disk;
db.gc();
const afterGc = db.storageStats().logicalBytes;

const next = db.blob.create(1024, { name: 'next.bin' });
const afterReuse = db.storageStats().logicalBytes;

assert(afterGc <= beforeDelete, 'gc should not grow after blob delete');
assert(afterReuse <= beforeDelete, 'verified blob reclaim should prevent net growth');
assert(db.blob.info(next).length === 1024, 'new blob info');

db.close();
TempDbPath.remove(dbPath);

console.log('B"H blob_fs_test PASS');
