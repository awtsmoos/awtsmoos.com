// B"H

/**
 * @file test/verified_free_list_test.js
 * @chapter A False Void Is Quarantined Before It Can Swallow Life
 * @description
 * Corrupts a persisted free-list claim so it targets a reachable ABLB body.
 * Verified mode must discard that claim, append safely, and preserve the body.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const Pointer = require('../utils/pointer/crown.js');
const FreeListCodec = require('../core/freeListCodec.js');
const coalesceFreeRanges = require('../core/allocator/freeRangeCoalescing.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-verified-free-'));
const dbPath = path.join(directory, 'quarantine.awtsdb');
const expected = Buffer.from('reachable-body-must-survive');
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: false });
	db.open();
	const blob = db.blob.create(expected);
	db.root.liveBlob = blob;
	db.root.dead = Buffer.alloc(4096, 7);
	delete db.root.dead;
	const gc = db.gc();
	assert(gc.ok, 'fixture GC failed');
	const freeListLocation = Pointer.decode(db.freeListPtrRaw);
	const malicious = FreeListCodec.encode([{ offset: blob.offset, length: blob.length }]);
	assert(malicious.length <= freeListLocation.length, 'fixture free-list vessel is too small');
	db.close();
	db = null;

	const handle = fs.openSync(dbPath, 'r+');
	try {
		const padded = Buffer.alloc(freeListLocation.length);
		malicious.copy(padded);
		fs.writeSync(handle, padded, 0, padded.length, freeListLocation.offset);
		fs.fsyncSync(handle);
	} finally {
		fs.closeSync(handle);
	}

	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	assert(db.allocator.freeList[0].offset === blob.offset, 'malicious fixture was not loaded');
	const location = db.allocator.allocate(Math.min(16, blob.length));
	assert(location.offset !== blob.offset, 'unverified range was reused');
	assert(db.allocator.reuseVerification.state === 'rejected-persisted-free-list', 'rejection state missing');
	assert(db.allocator.rejectedFreeList.length === 1, 'rejected ranges were not quarantined');
	assert(Buffer.compare(db.blob.read(db.root.liveBlob), expected) === 0, 'live blob was corrupted');

	let overlapRejected = false;
	try {
		coalesceFreeRanges([{ offset: 64, length: 20 }, { offset: 70, length: 10 }], 200);
	} catch (error) {
		overlapRejected = error.code === 'AWTSMOOS_DB_INVALID_FREE_RANGE';
	}
	assert(overlapRejected, 'overlapping free ranges were not rejected');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H verified_free_list_test PASS');
