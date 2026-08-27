// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/vector_bulk_key_map_density_test.js
 * @chapter One Thousand Vector Names Must Not Leave A Thousand Retired Maps
 * @description Proves a bulk HNSW graph persists one complete key ledger, bounded
 * free space, metadata-only payloads, strict search, audit, and read-only reopen.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function vector(index, dimensions = 8) {
	return Array.from(
		{ length: dimensions },
		(_value, dimension) => Math.sin((index + 1) * (dimension + 1))
	);
}

function entries(count = 1000) {
	return Array.from({ length: count }, (_, index) => ({
		key: `vector-key-${String(index).padStart(4, '0')}`,
		vector: vector(index),
		payload: {
			id: `vector-key-${String(index).padStart(4, '0')}`,
			corpus: index % 2 ? 'odd' : 'even',
			text: `payload-${index}`
		}
	}));
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-key-density-'));
const databasePath = path.join(directory, 'density.awtsdb');
const sourceEntries = entries();
let database;

try {
	database = new AwtsmoosDB(databasePath, {
		compression: false,
		reuseFreedSpace: 'verified'
	});
	database.open();
	database.createList(database.root, 'records');
	const load = database.vector.bulkLoadDetached(
		database.root.records,
		sourceEntries,
		{
			dimensions: 8,
			chunkSize: sourceEntries.length
		}
	);
	assert(load.registryCount === sourceEntries.length, 'bulk registry count changed');
	assert(load.graphDurabilityBoundaries === 1, 'bulk graph used multiple boundaries');
	assert(database.vector.entries(database.root.records).length === sourceEntries.length, 'bulk key count changed');
	assert(database.root.records[0].vector === undefined, 'payload duplicated a vector');
	const audit = database.vector.auditIndex(database.root.records);
	const verification = database.verify();
	const logicalBytes = fs.statSync(databasePath).size;
	const freeRatio = Number(verification.freeBytes || 0) / Math.max(1, logicalBytes);
	assert(audit.ok, 'bulk key-map graph audit failed');
	assert(verification.ok, 'bulk key-map verifier failed');
	assert(freeRatio < 0.15, `bulk key-map free ratio is ${freeRatio}`);
	assert(Number(verification.freeRanges || 0) < 250, 'bulk key-map free ranges are unbounded');
	const query = sourceEntries[731].vector;
	const hit = database.vector.nearestIndexed(database.root.records, query, 1)[0];
	assert(hit.item.id === sourceEntries[731].key, 'strict self-vector top-1 changed');
	database.close();
	database = null;

	database = new AwtsmoosDB(databasePath, { readOnly: true });
	database.open();
	assert(database.vector.entries(database.root.records).length === sourceEntries.length, 'reopened key count changed');
	assert(database.vector.auditIndex(database.root.records).ok, 'reopened graph audit failed');
	const reopened = database.vector.nearestIndexed(
		database.root.records,
		sourceEntries[731].vector,
		1
	)[0];
	assert(reopened.item.id === sourceEntries[731].key, 'reopened strict top-1 changed');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_bulk_key_map_density_test PASS');
