// B"H

/**
 * @file test/strict_read_only_test.js
 * @chapter The Witness Reads The Scroll Without Moving One Grain Of Dust
 * @description
 * Proves OS-level read-only opening, pager write refusal, no new lock sidecars,
 * and exact byte, size, mtime, and directory invariance for every source artifact.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function fileDigest(filePath) {
	return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function snapshotTree(directory) {
	const output = {};

	function walk(current, relative) {
		const entries = fs.readdirSync(current, { withFileTypes: true })
			.sort((left, right) => left.name.localeCompare(right.name));

		for (const entry of entries) {
			const absolute = path.join(current, entry.name);
			const childRelative = relative ? path.join(relative, entry.name) : entry.name;
			const stat = fs.statSync(absolute, { bigint: true });
			if (entry.isDirectory()) {
				output[childRelative] = {
					type: 'directory',
					mtimeNs: stat.mtimeNs.toString()
				};
				walk(absolute, childRelative);
				continue;
			}

			output[childRelative] = {
				type: 'file',
				size: stat.size.toString(),
				mtimeNs: stat.mtimeNs.toString(),
				hash: fileDigest(absolute)
			};
		}
	}

	walk(directory, '');
	return output;
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-read-only-'));
const dbPath = path.join(directory, 'source.awtsdb');
const missingPath = path.join(directory, 'missing.awtsdb');
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false });
	db.open();
	db.root.message = 'read without touching';
	db.root.bytes = Buffer.from([1, 2, 3, 4]);
	db.close();
	db = null;
	fs.chmodSync(dbPath, 0o444);

	const before = snapshotTree(directory);
	db = new AwtsmoosDB(dbPath, {
		readOnly: true,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	db.open();
	assert(String(db.root.message) === 'read without touching', 'read-only value mismatch');
	assert(db.verify().ok, 'read-only verification failed');

	let pagerRefused = false;
	try {
		db.pager.writeExact(64, Buffer.from([9]));
	} catch (error) {
		pagerRefused = error.code === 'AWTSMOOS_DB_READONLY_WRITE';
	}
	assert(pagerRefused, 'pager write doorway did not refuse read-only mutation');
	db.close();
	db = null;

	const after = snapshotTree(directory);
	assert(JSON.stringify(after) === JSON.stringify(before), `read-only artifacts changed: ${JSON.stringify({ before, after })}`);
	assert(!Object.keys(after).some(name => name.endsWith('.lock')), 'read-only open created a lock file');
	assert(!Object.keys(after).some(name => name.includes('.readers')), 'read-only open created reader sidecars');

	let missingRefused = false;
	try {
		new AwtsmoosDB(missingPath, { readOnly: true }).open();
	} catch (error) {
		missingRefused = error.code === 'AWTSMOOS_DB_READONLY_MISSING';
	}
	assert(missingRefused, 'read-only open did not reject a missing database');
	assert(!fs.existsSync(missingPath), 'read-only missing open created a file');
} finally {
	if (db) db.close();
	try { fs.chmodSync(dbPath, 0o644); } catch (_error) {}
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H strict_read_only_test PASS');
