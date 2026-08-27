// B"H

/**
 * @file test/storage_report_test.js
 * @chapter The Ledger Tells The Truth Without Performing The Judgment
 * @description
 * Verifies that persisted claims, reachable proof, fragmentation, sidecars, and
 * vacuum gates remain distinct in the administrative storage report.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-storage-report-'));
const dbPath = path.join(directory, 'report.awtsdb');
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.root.live = 'still here';
	db.root.discarded = Buffer.alloc(2048, 3);
	delete db.root.discarded;
	db.gc();

	const report = db.storageReport();
	assert(report.path === dbPath, 'storage report path mismatch');
	assert(report.verification.ok, `storage verification failed: ${JSON.stringify(report.verification.errors)}`);
	assert(report.physicalBytes >= report.logicalBytes, 'physical size is below logical cursor');
	assert(report.reachableBytes > 0, 'reachable byte count missing');
	assert(report.verifiedFree.bytes >= 0, 'verified free bytes missing');
	assert(report.persistedFree.bytes >= 0, 'persisted free bytes missing');
	assert(report.vacuum.inPlaceAllowed === false, 'in-place vacuum was advertised');
	assert(report.vacuum.outOfPlaceCandidate === true, 'verified database was not marked as an out-of-place candidate');
	assert(report.vacuum.requiresSemanticComparison === true, 'semantic comparison gate missing');
	assert(report.sidecars.wal.exists === fs.existsSync(`${dbPath}.wal`), 'WAL sidecar state mismatch');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H storage_report_test PASS');
