// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/vector_detached_bulk_load_test.js
 * @chapter One Float32 Flame Lives In The Graph And Nowhere In Its Payload
 * @description Proves metadata-only payloads, strict and exact persisted search,
 * graph audit, verifier reachability, and read-only reopen without JSONL mirrors.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function ids(results) {
	return results.map(result => result.item.id);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-detached-vector-'));
const databasePath = path.join(directory, 'detached.awtsdb');
const entries = [
	{ key: 'A', vector: [1, 0, 0, 0], payload: { id: 'A', corpus: 'one', text: 'alpha' } },
	{ key: 'B', vector: [0, 1, 0, 0], payload: { id: 'B', corpus: 'one', text: 'beta' } },
	{ key: 'C', vector: [0.9, 0.1, 0, 0], payload: { id: 'C', corpus: 'two', text: 'gamma' } },
	{ key: 'D', vector: [0, 0, 1, 0], payload: { id: 'D', corpus: 'two', text: 'delta' } }
];
let database;

try {
	database = new AwtsmoosDB(databasePath, { compression: false });
	database.open();
	database.createList(database.root, 'records');
	const report = database.vector.bulkLoadDetached(database.root.records, entries, {
		dimensions: 4,
		chunkSize: 2
	});
	assert(report.loaded === entries.length, 'detached load count mismatch');
	assert(report.registryCount === entries.length, 'detached graph count mismatch');
	for (let index = 0; index < entries.length; index++) {
		const row = database.root.records[index];
		assert(row.id === entries[index].key, `payload ${index} changed`);
		assert(row.vec === undefined && row.vector === undefined && row.embedding === undefined, `payload ${index} duplicated a vector`);
	}
	const indexed = database.vector.nearestIndexed(database.root.records, [1, 0, 0, 0], 2);
	const exact = database.vector.nearestExact(database.root.records, [1, 0, 0, 0], 2);
	assert(JSON.stringify(ids(indexed)) === JSON.stringify(['A', 'C']), 'strict indexed ordering changed');
	assert(JSON.stringify(ids(exact)) === JSON.stringify(['A', 'C']), 'persisted exact ordering changed');
	const persisted = database.vector.entries(database.root.records);
	assert(persisted.length === entries.length, 'persisted vector enumeration lost entries');
	assert(persisted.every(entry => entry.vector instanceof Float32Array), 'persisted vectors are not Float32Array');
	assert(database.vector.auditIndex(database.root.records).ok, 'detached graph audit failed');
	assert(database.verify().ok, 'detached database verification failed');
	database.close();
	database = null;

	database = new AwtsmoosDB(databasePath, { readOnly: true });
	database.open();
	assert(JSON.stringify(ids(database.vector.nearestIndexed(database.root.records, [1, 0, 0, 0], 2))) === JSON.stringify(['A', 'C']), 'reopened strict search changed');
	assert(database.vector.entries(database.root.records).length === entries.length, 'reopened persisted vectors changed');
	assert(database.vector.auditIndex(database.root.records).ok, 'reopened detached graph audit failed');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_detached_bulk_load_test PASS');
