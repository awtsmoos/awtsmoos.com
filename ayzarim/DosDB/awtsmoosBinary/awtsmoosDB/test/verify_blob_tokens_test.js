// B"H

/**
 * @file test/verify_blob_tokens_test.js
 * @chapter The Living Body Is Never Mistaken For Empty Space
 * @description
 * Proves that a reachable modern ABLB token keeps its separate blob body in the
 * reachability ledger across flush and reopen.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function intersects(left, right) {
	return left.offset < right.offset + right.length && right.offset < left.offset + left.length;
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-ablb-verify-'));
const dbPath = path.join(directory, 'live-blob.awtsdb');
const expected = Buffer.from('the-body-remains-reachable');
let body;
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: false });
	db.open();
	const blob = db.blob.create(expected, { purpose: 'verifier-regression' });
	body = { offset: blob.offset, length: blob.length };
	db.root.liveBlob = blob;
	db.waitForIdle();

	let report = db.verify();
	assert(report.ok, `live ABLB verification failed: ${JSON.stringify(report.errors)}`);
	assert(!report.free.some(range => intersects(range, body)), 'live blob body appeared in free-space complement');
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	report = db.verify();
	assert(report.ok, `reopened ABLB verification failed: ${JSON.stringify(report.errors)}`);
	assert(!report.free.some(range => intersects(range, body)), 'reopened blob body appeared free');
	assert(Buffer.compare(db.blob.read(db.root.liveBlob), expected) === 0, 'reopened blob body changed');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H verify_blob_tokens_test PASS');
