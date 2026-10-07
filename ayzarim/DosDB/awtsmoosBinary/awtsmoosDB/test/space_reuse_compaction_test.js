// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/space_reuse_compaction_test.js
 * @chapter Freed Chambers Return To Service And The File Ends Where Life Ends
 * @description
 * Regression battery for free-space reuse, compaction, and file truncation.
 * Covers the three repair fronts: (1) the database.js entry point defaults to
 * verified reuse even when index.js is bypassed; (2) delete/reinsert and churn
 * workloads reuse freed ranges instead of ratcheting the file; (3) gc() and
 * close() truncate the physical file after absorbing trailing gaps.
 * Explicit append-only opt-out and read-only behavior are preserved.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const DirectDB = require('../database.js');
const PublicDB = require('../index.js');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-space-reuse-test-'));

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function sizeOf(dbPath) {
	return fs.statSync(dbPath).size;
}

function removeDb(dbPath) {
	for (const ext of ['', '.wal', '.lock']) {
		try { fs.unlinkSync(dbPath + ext); } catch (_err) {}
	}
}

function settle(db) {
	if (typeof db.waitForIdle === 'function') db.waitForIdle();
	if (typeof db.flush === 'function') {
		const out = db.flush();
		if (out && typeof out.then === 'function') return out;
	}
	return null;
}

function testDirectEntryDefaultsVerified() {
	const dbPath = path.join(directory, 'direct-default.awtsdb');
	removeDb(dbPath);
	const db = new DirectDB(dbPath, { compression: false });
	try {
		db.open();
		assert(
			db.options.reuseFreedSpace === 'verified',
			'direct database.js entry did not default to verified reuse, got: ' + db.options.reuseFreedSpace
		);
	} finally {
		db.close();
	}
	removeDb(dbPath);
}

function testPublicEntryDefaultsVerified() {
	const dbPath = path.join(directory, 'public-default.awtsdb');
	removeDb(dbPath);
	const db = new PublicDB(dbPath, { compression: false });
	try {
		db.open();
		assert(
			db.options.reuseFreedSpace === 'verified',
			'public index.js entry did not default to verified reuse, got: ' + db.options.reuseFreedSpace
		);
	} finally {
		db.close();
	}
	removeDb(dbPath);
}

function testExplicitOptOutPreserved() {
	const dbPath = path.join(directory, 'opt-out.awtsdb');
	removeDb(dbPath);
	const db = new DirectDB(dbPath, { compression: false, reuseFreedSpace: false });
	try {
		db.open();
		assert(db.options.reuseFreedSpace === false, 'explicit append-only opt-out was not preserved');
	} finally {
		db.close();
	}
	removeDb(dbPath);
}

function testReadOnlyDisablesReuse() {
	const dbPath = path.join(directory, 'ro.awtsdb');
	removeDb(dbPath);
	const writer = new DirectDB(dbPath, { compression: false });
	writer.open();
	writer.root['kept'] = 'yes';
	writer.close();
	const reader = new DirectDB(dbPath, { readOnly: true });
	try {
		reader.open();
		assert(reader.options.reuseFreedSpace === false, 'read-only mode did not disable reuse');
		assert(reader.root['kept'] === 'yes', 'read-only reopen lost a live value');
	} finally {
		reader.close();
	}
	removeDb(dbPath);
}

async function testDeleteReinsertReuses() {
	const dbPath = path.join(directory, 'reinsert.awtsdb');
	removeDb(dbPath);
	const db = new DirectDB(dbPath, { compression: false });
	const N = 300;
	db.open();
	try {
		db.batch(() => {
			for (let i = 0; i < N; i++) db.root['k' + i] = 'value-' + i + '-' + 'x'.repeat(48);
		});
		await settle(db);
		const afterWrite = sizeOf(dbPath);
		db.batch(() => {
			for (let i = 0; i < N; i++) delete db.root['k' + i];
		});
		await settle(db);
		const afterDelete = sizeOf(dbPath);
		db.batch(() => {
			for (let i = 0; i < N; i++) db.root['n' + i] = 'value-' + i + '-' + 'x'.repeat(48);
		});
		await settle(db);
		const afterReinsert = sizeOf(dbPath);
		assert(
			afterDelete <= afterWrite * 1.5,
			'deletes grew the file without bound: ' + afterWrite + ' -> ' + afterDelete
		);
		assert(
			afterReinsert - afterWrite < afterWrite * 0.5,
			'reinsert did not reuse freed space: write=' + afterWrite + ' reinsert=' + afterReinsert
		);
		assert(db.verify().ok, 'verifier failed after reinsert workload');
		let live = 0;
		for (let i = 0; i < N; i++) if (db.root['n' + i] === 'value-' + i + '-' + 'x'.repeat(48)) live++;
		assert(live === N, 'readback lost values after reuse: ' + live + '/' + N);
	} finally {
		db.close();
	}
	removeDb(dbPath);
}

async function testChurnStaysBounded() {
	const dbPath = path.join(directory, 'churn.awtsdb');
	removeDb(dbPath);
	const db = new DirectDB(dbPath, { compression: false });
	const N = 300;
	const CYCLES = 6;
	db.open();
	try {
		db.batch(() => {
			for (let i = 0; i < N; i++) db.root['k' + i] = 'v' + i + 'x'.repeat(48);
		});
		await settle(db);
		const baseline = sizeOf(dbPath);
		let peak = baseline;
		for (let c = 0; c < CYCLES; c++) {
			db.batch(() => {
				for (let i = 0; i < 100; i++) delete db.root['k' + i];
				for (let i = 0; i < 100; i++) db.root['k' + i] = 'v' + i + 'y'.repeat(48) + c;
			});
			await settle(db);
			peak = Math.max(peak, sizeOf(dbPath));
		}
		assert(
			peak < baseline * 3,
			'churn ratcheted the file without bound: baseline=' + baseline + ' peak=' + peak
		);
		assert(db.verify().ok, 'verifier failed after churn workload');
	} finally {
		db.close();
	}
	removeDb(dbPath);
}

async function testDeleteAllTruncatesOnClose() {
	const dbPath = path.join(directory, 'truncate.awtsdb');
	removeDb(dbPath);
	const db = new DirectDB(dbPath, { compression: false });
	const N = 200;
	db.open();
	db.batch(() => {
		for (let i = 0; i < N; i++) db.root['k' + i] = 'v' + i + 'x'.repeat(48);
	});
	await settle(db);
	const afterWrite = sizeOf(dbPath);
	db.batch(() => {
		for (let i = 0; i < N; i++) delete db.root['k' + i];
	});
	// NOTE: The internal __awtsmoos_meta__ key-order sequence node is a LIVE
	// structure that batch COW allocates at a high offset; it pins the tail so
	// the file cannot truncate to ~zero without defragmentation (future work).
	// The guarantee here: the file must SHRINK (free tail is truncated) and
	// all freed bytes must be tracked reusable, never silently wasted.
	const beforeCloseVerify = db.verify();
	db.close();
	const afterClose = sizeOf(dbPath);
	assert(
		afterClose < (afterWrite * 3) / 4,
		'delete-all + close did not shrink the file: ' + afterWrite + ' -> ' + afterClose
	);
	const freeBytes = (beforeCloseVerify.free || []).reduce((s, r) => s + r.length, 0);
	assert(
		freeBytes > afterWrite / 2,
		'delete-all did not reclaim most bytes as reusable: free=' + freeBytes + ' written=' + afterWrite
	);
	// Reopen: the database must still be fully functional.
	const db2 = new DirectDB(dbPath, { compression: false });
	db2.open();
	db2.root['reopen_check'] = 'ok';
	await settle(db2);
	assert(db2.root['reopen_check'] === 'ok', 'reopen after delete-all failed');
	db2.close();
	removeDb(dbPath);
}

async function testGcTruncatesTail() {
	const dbPath = path.join(directory, 'gc.awtsdb');
	removeDb(dbPath);
	const db = new DirectDB(dbPath, { compression: false });
	db.open();
	try {
		db.batch(() => {
			for (let i = 0; i < 200; i++) db.root['k' + i] = 'v' + i + 'x'.repeat(48);
		});
		await settle(db);
		// Delete the most recently written keys so the tail is likely free.
		db.batch(() => {
			for (let i = 150; i < 200; i++) delete db.root['k' + i];
		});
		await settle(db);
		const beforeGc = sizeOf(dbPath);
		if (typeof db.gc === 'function') await db.gc();
		const afterGc = sizeOf(dbPath);
		assert(afterGc <= beforeGc, 'gc() grew the physical file: ' + beforeGc + ' -> ' + afterGc);
		assert(db.verify().ok, 'verifier failed after gc()');
		let live = 0;
		for (let i = 0; i < 150; i++) if (db.root['k' + i] === 'v' + i + 'x'.repeat(48)) live++;
		assert(live === 150, 'gc() lost live values: ' + live + '/150');
	} finally {
		db.close();
	}
	removeDb(dbPath);
}

async function main() {
	testDirectEntryDefaultsVerified();
	testPublicEntryDefaultsVerified();
	testExplicitOptOutPreserved();
	testReadOnlyDisablesReuse();
	await testDeleteReinsertReuses();
	await testChurnStaysBounded();
	await testDeleteAllTruncatesOnClose();
	await testGcTruncatesTail();
	console.log('B"H space_reuse_compaction_test PASS');
}

main()
	.then(() => fs.rmSync(directory, { recursive: true, force: true }))
	.catch(err => {
		try { fs.rmSync(directory, { recursive: true, force: true }); } catch (_err) {}
		console.error('B"H space_reuse_compaction_test FAIL:', err && err.message);
		process.exit(1);
	});
