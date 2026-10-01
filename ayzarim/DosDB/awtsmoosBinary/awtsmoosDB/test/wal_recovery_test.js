// B"H
'use strict';

const fs = require('fs');
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

const CURRENT_MAGIC = Buffer.from('AWAL3');

/**
 * @file wal_recovery_test.js
 * @description
 * One committed generation stands like a remembered word. The next generation
 * reaches the WAL but only part of its pages reach the data file before the
 * simulated rupture. Reopening must restore the whole unfinished generation
 * from the journal bound to this very incarnation.
 */
function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function writePartialDirtyImage(pager, boundary) {
	for (const [index, page] of pager.pages) {
		if (!page.dirty) continue;
		const pageStart = index * pager.pageSize;
		if (pageStart >= boundary) continue;
		const length = Math.min(pager.pageSize, boundary - pageStart);
		if (length > 0) fs.writeSync(pager.fd, page.buf, 0, length, pageStart);
	}
	fs.ftruncateSync(pager.fd, boundary);
	fs.fsyncSync(pager.fd);
}

function simulateProcessDeath(database, pager) {
	if (pager.walFd !== null) fs.closeSync(pager.walFd);
	if (pager.fd !== null) fs.closeSync(pager.fd);
	pager.walFd = null;
	pager.fd = null;
	pager.pages.clear();
	pager.initialized = false;
	if (database.processLock) database.processLock.release();
}

const databasePath = TempDbPath.make('wal_recovery');
const walPath = `${databasePath}.wal`;
TempDbPath.remove(databasePath);

let database = new AwtsmoosDB(databasePath, { compression: false });
database.open();
database.root.before = 'stable';
database.close();

const committedSize = fs.statSync(databasePath).size;
database = new AwtsmoosDB(databasePath, { compression: false });
database.open();
const pager = database.pager._inner;
const originalFsync = pager.fsync;

pager.fsync = function flushOnlyDurableWal() {
	this._flushWal();
};
database.root.after = 'from wal';

assert(fs.existsSync(walPath), 'wal must exist before simulated crash');
const walBytes = fs.readFileSync(walPath);
assert(walBytes.length > CURRENT_MAGIC.length, 'wal must contain mutation records');
assert(
	walBytes.subarray(0, CURRENT_MAGIC.length).equals(CURRENT_MAGIC),
	'new writes must use AWAL3 incarnation binding'
);

const dirtySize = pager.logicalSize();
const partialBoundary = Math.max(committedSize, dirtySize - 16);
assert(partialBoundary < dirtySize, 'simulation must omit part of dirty generation');
writePartialDirtyImage(pager, partialBoundary);
pager.fsync = originalFsync;
simulateProcessDeath(database, pager);

database = new AwtsmoosDB(databasePath, { compression: false });
database.open();
assert(database.root.before === 'stable', 'pre-crash value should remain');
assert(database.root.after === 'from wal', 'wal value should recover');
assert(fs.statSync(databasePath).size === dirtySize, 'recovery should restore logical size');
assert(
	!fs.existsSync(walPath) || fs.statSync(walPath).size === 0,
	'wal should clear after recovery'
);

database.close();
TempDbPath.remove(databasePath);
console.log('B"H wal_recovery_test PASS');
