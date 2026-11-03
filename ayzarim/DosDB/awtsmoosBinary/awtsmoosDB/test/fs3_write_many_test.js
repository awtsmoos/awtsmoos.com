// B"H

/**
 * @file test/fs3_write_many_test.js
 * @chapter Many Sets Enter By One Door And Leave No Half-Written Room
 * @description
 * Db-phase2 FS3 multi-set primitive (api/fs/v3/writeMany.js): many sets
 * applied under one db.batch + one manifest flush. Proves the accepted
 * entry shapes, overwrite semantics, durability across reopen, error
 * propagation, and manifest-level atomicity — a batch whose callback
 * throws performs no flush, so a raw copy of the on-disk file (the
 * crash view) contains none of the batch's sets while the pre-batch
 * state is intact.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const STORE_OPTS = {
	debug: false, readOnly: false, reuseFreedSpace: 'verified', versions: false,
	virtualFsCompression: true, wal: false, processLockMode: 'exclusive', lockMode: 'exclusive'
};

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-write-many-'));
const dbPath = path.join(directory, 'many.fs.awtsdb');
const copyPath = path.join(directory, 'many-copy.fs.awtsdb');
let db;

try {
	db = new AwtsmoosDB(dbPath, { ...STORE_OPTS });
	db.open();

	const results = db.fs.writeMany([
		['/a/one', Buffer.from('1')],
		['/a/two', Buffer.from('22')],
		{ path: '/b/three', value: '333' }
	]);
	assert(results.length === 3 && results.every(Boolean), 'writeMany must return one result per entry');
	assert(db.fs.cat('/a/one').toString() === '1', 'array-pair entry not readable');
	assert(db.fs.cat('/b/three').toString() === '333', 'object entry not readable');

	db.fs.writeMany(new Map([['/a/one', Buffer.from('uno')]]));
	assert(db.fs.cat('/a/one').toString() === 'uno', 'Map entry overwrite failed');

	db.fs.writeMany({ '/c/four': Buffer.from('4') }, { flush: false });
	db.fs.flush();
	assert(db.fs.cat('/c/four').toString() === '4', 'plain-object entries with flush:false were lost');

	// Error propagation + no flush performed by the failing batch.
	let threw = false;
	try {
		db.fs.writeMany([['/x/new1', Buffer.from('n1')], ['/a', Buffer.from('boom')]]);
	} catch (_error) { threw = true; }
	assert(threw, 'writeMany must propagate an entry error (IS_DIRECTORY)');

	// Crash view: raw copy of the on-disk file while the handle is open.
	fs.copyFileSync(dbPath, copyPath);
	db.close();
	db = null;

	const crashed = new AwtsmoosDB(copyPath, { ...STORE_OPTS });
	crashed.open();
	const stat = crashed.fs.stat('/x/new1');
	assert(!stat || !stat.exists, 'crashed view must not contain the unflushed batch entry');
	assert(crashed.fs.cat('/a/one').toString() === 'uno', 'crashed view lost pre-batch state');
	crashed.close();

	db = new AwtsmoosDB(dbPath, { ...STORE_OPTS });
	db.open();
	assert(db.fs.cat('/a/two').toString() === '22', 'writeMany entries not durable across reopen');
	assert(db.fs.cat('/c/four').toString() === '4', 'flush:false + explicit flush entry not durable');
	db.close();
	db = null;
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H fs3_write_many_test PASS');
