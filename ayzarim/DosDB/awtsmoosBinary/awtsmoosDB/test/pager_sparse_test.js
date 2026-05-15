// B"H

/**
 * @file pager_sparse_test.js
 * @chapter The File Is Vast, The Touch Is Small
 * @description Ensures opening and reading a large DB does not mirror all bytes.
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const fs = require('fs');
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

const dbPath = TempDbPath.make('pager_sparse');
TempDbPath.remove(dbPath);

let db = new AwtsmoosDB(dbPath, { compression: false });
db.open();
db.root.small = 'near root';
db.close();

const fd = fs.openSync(dbPath, 'r+');
try {
  fs.ftruncateSync(fd, 8 * 1024 * 1024);
} finally {
  fs.closeSync(fd);
}

const fileInfo = AwtsmoosDB.inspectFile(dbPath);
assert(fileInfo.physicalBytes >= 8 * 1024 * 1024, 'fixture should be physically large');

db = new AwtsmoosDB(dbPath, { compression: false });
db.open();

const before = db.memoryStats().pagerBytes;
const value = db.root.small;
const after = db.memoryStats().pagerBytes;

assert(value === 'near root', 'sparse pager read roundtrip');
assert(before < fileInfo.physicalBytes / 4, `open should not mirror file: pager=${before}, file=${fileInfo.physicalBytes}`);
assert(after < fileInfo.physicalBytes / 4, `small read should not mirror file: pager=${after}, file=${fileInfo.physicalBytes}`);

db.close();
TempDbPath.remove(dbPath);

console.log('B"H pager_sparse_test PASS');
