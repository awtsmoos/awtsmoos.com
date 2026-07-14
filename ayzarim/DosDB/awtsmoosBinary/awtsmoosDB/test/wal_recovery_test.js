// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file wal_recovery_test.js
 * @chapter The Durable Scroll Restores the Interrupted Page
 * @description
 * Establishes one committed generation, allows the next generation to fsync its
 * real WAL while withholding data-page application, writes only a partial dirty
 * image, and then simulates process death. On reopen, the WAL must restore both
 * old and new values. As the Awtsmoos renews every byte, the test distinguishes
 * a true interrupted commit from arbitrary corruption after a completed commit.
 */

const fs = require('fs');
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

const WAL_MAGIC = Buffer.from('AWAL1');

/**
 * @param {boolean} condition - Required truth.
 * @param {string} message - Failure revelation.
 * @returns {void}
 */
function assert(condition, message) {
	if (!condition) throw new Error(message);
}

/**
 * @param {object} pager - Writable pager beneath the public facade.
 * @param {number} boundary - Final byte allowed to reach the data file.
 * @returns {void}
 */
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

/**
 * @param {object} pager - Writable pager whose process is being abandoned.
 * @returns {void}
 */
function simulateProcessDeath(pager) {
	if (pager.walFd !== null) fs.closeSync(pager.walFd);
	if (pager.fd !== null) fs.closeSync(pager.fd);
	pager.walFd = null;
	pager.fd = null;
	pager.pages.clear();
	pager.initialized = false;
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
pager.fsync = function flushOnlyTheDurableWal() {
	this._flushWal();
};

database.root.after = 'from wal';
assert(fs.existsSync(walPath), 'wal must exist before the simulated crash');
const walBytes = fs.readFileSync(walPath);
assert(walBytes.length > WAL_MAGIC.length, 'wal must contain mutation records');
assert(walBytes.subarray(0, WAL_MAGIC.length).equals(WAL_MAGIC), 'wal magic must be valid');

const dirtySize = pager.logicalSize();
const partialBoundary = Math.max(committedSize, dirtySize - 16);
assert(partialBoundary < dirtySize, 'simulation must omit part of the dirty generation');
writePartialDirtyImage(pager, partialBoundary);
pager.fsync = originalFsync;
simulateProcessDeath(pager);

database = new AwtsmoosDB(databasePath, { compression: false });
database.open();
assert(database.root.before === 'stable', 'pre-crash value should remain');
assert(database.root.after === 'from wal', 'wal value should recover');
assert(fs.statSync(databasePath).size === dirtySize, 'recovery should restore logical size');
assert(!fs.existsSync(walPath) || fs.statSync(walPath).size === 0, 'wal should clear after recovery');

database.close();
TempDbPath.remove(databasePath);
console.log('B"H wal_recovery_test PASS');
