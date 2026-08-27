// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/sequence_metadata_test.js
 * @chapter The River Keeps Its Names Across Sleep And Renewal
 * @description
 * Proves that an anchored list preserves numeric positions and named metadata,
 * exposes those names through enumeration, survives reopen, supports deletion,
 * and remains fully visible to the verifier. The Awtsmoos renews every pointer
 * without allowing a living metadata chamber to appear as reusable emptiness.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-sequence-metadata-'));
const databasePath = path.join(directory, 'metadata.awtsdb');
let database;

try {
	database = new AwtsmoosDB(databasePath, {
		compression: false,
		reuseFreedSpace: 'verified'
	});
	database.open();
	database.createList(database.root, 'records');
	database.root.records.push({ id: 'one', text: 'first' });
	database.root.records.push({ id: 'two', text: 'second' });
	database.root.records.label = 'canonical-list';
	database.root.records.settings = { dimensions: 32, metric: 'cosine' };

	assert(database.root.records.length === 2, 'numeric length changed after metadata writes');
	assert(database.root.records[1].id === 'two', 'numeric sequence value changed');
	assert(database.root.records.label === 'canonical-list', 'label was not readable');
	assert(database.root.records.settings.metric === 'cosine', 'nested metadata was not readable');
	assert(Object.keys(database.root.records).includes('label'), 'label was not enumerable');
	assert(Object.keys(database.root.records).includes('settings'), 'settings was not enumerable');
	assert(database.verify().ok, 'verification failed before first close');
	database.close();
	database = null;

	database = new AwtsmoosDB(databasePath, {
		compression: false,
		reuseFreedSpace: 'verified'
	});
	database.open();
	assert(database.root.records.label === 'canonical-list', 'label was lost after reopen');
	assert(database.root.records.settings.dimensions === 32, 'settings were lost after reopen');
	assert(database.root.records[0].text === 'first', 'numeric data was lost after reopen');
	assert(database.verify().ok, 'verification failed after reopen');
	delete database.root.records.label;
	assert(database.root.records.label === undefined, 'deleted label remained readable');
	assert(!Object.keys(database.root.records).includes('label'), 'deleted label remained enumerable');
	assert(database.root.records.settings.metric === 'cosine', 'other metadata changed after deletion');
	assert(database.verify().ok, 'verification failed after metadata deletion');
	database.close();
	database = null;

	database = new AwtsmoosDB(databasePath, { readOnly: true });
	database.open();
	assert(database.root.records.label === undefined, 'deleted label returned after read-only reopen');
	assert(database.root.records.settings.dimensions === 32, 'settings missing after read-only reopen');
	assert(database.root.records.length === 2, 'sequence length changed after read-only reopen');
	assert(database.verify().ok, 'read-only verification failed');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H sequence_metadata_test PASS');
