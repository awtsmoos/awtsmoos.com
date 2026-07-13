// B"H

/**
 * @file test/map_root_split_test.js
 * @chapter The Two-Hundred-And-First Key Raises A New Root Instead Of Vanishing
 * @description Proves multi-level map insertion, verified allocation, and reopen persistence.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function verifySamples(db, index) {
	assert(db.keys(index).length === 500, `expected 500 keys, received ${db.keys(index).length}`);
	for (const value of [0, 99, 199, 200, 201, 399, 499]) {
		assert(index[String(value)][0] === value, `map value ${value} was lost`);
	}
	assert(db.verify().ok, 'map allocation verification failed');
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-map-root-split-'));
const dbPath = path.join(directory, 'map.awtsdb');
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.createMap(db.root, 'index');
	for (let value = 0; value < 500; value++) {
		db.createList(db.root.index, String(value));
		db.root.index[String(value)].push(value);
	}
	verifySamples(db, db.root.index);
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { readOnly: true });
	db.open();
	verifySamples(db, db.root.index);
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H map_root_split_test PASS');
