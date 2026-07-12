// B"H

/**
 * @file test/compact_cli_refusal_test.js
 * @chapter The Old Door Refuses To Pretend That A Scan Is Compaction
 * @description
 * Proves the historical compact command rejects a one-path invocation, returns
 * a non-success status, creates no candidate, and preserves the source bytes.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function digest(filePath) {
	return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-compact-refusal-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const unexpectedPath = path.join(directory, 'source.awtsdb.compact');
let db;

try {
	db = new AwtsmoosDB(sourcePath, { compression: false });
	db.open();
	db.root.message = 'the source remains untouched';
	db.close();
	db = null;
	const before = digest(sourcePath);
	const result = spawnSync(process.execPath, [
		path.join(__dirname, '../scripts/compact_awtsdb.js'),
		sourcePath
	], { encoding: 'utf8' });
	assert(result.status === 2, `one-path compact returned ${result.status}`);
	assert(result.stderr.includes('no longer mutates a source database in place'), 'refusal explanation was absent');
	assert(digest(sourcePath) === before, 'one-path compact changed source bytes');
	assert(!fs.existsSync(unexpectedPath), 'one-path compact created an implicit candidate');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H compact_cli_refusal_test PASS');
