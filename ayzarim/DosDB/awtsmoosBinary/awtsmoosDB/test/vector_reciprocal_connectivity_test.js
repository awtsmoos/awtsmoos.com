// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/vector_reciprocal_connectivity_test.js
 * @chapter The Newest Vector Must Never Become An Unreachable Island
 * @description Builds a deliberately narrow HNSW graph, proves every unique query
 * retrieves itself, checks inbound level-zero reachability, and repeats after reopen.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const constants = require('../constants.js');
const createSourceIterator = require('../api/vector/reindex/sourceIterator.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function vectorFor(index, dimensions = 12) {
	const values = [];
	let magnitude = 0;
	for (let dimension = 0; dimension < dimensions; dimension++) {
		const base = ((index + 11) * (dimension + 17) % 997) / 997;
		const value = base + (dimension === index % dimensions ? 1.25 : 0);
		values.push(value);
		magnitude += value * value;
	}
	const norm = Math.sqrt(magnitude) || 1;
	return values.map(value => value / norm);
}

function assertSelfQueries(database, rows, label) {
	for (const row of rows) {
		const hit = database.vector.nearestIndexed(
			database.root.records,
			row.vector,
			1
		)[0];
		assert(hit?.item?.id === row.id, `${label} lost self query ${row.id}`);
	}
}

function assertInbound(index, count) {
	const inbound = new Array(count).fill(0);
	for (let id = 0; id < count; id++) {
		const node = index.registry.getNode(id);
		for (const neighborId of node?.neighbors?.[0] || []) {
			if (neighborId >= 0 && neighborId < count) inbound[neighborId]++;
		}
	}
	for (let id = 1; id < count; id++) {
		assert(inbound[id] > 0, `node ${id} has no inbound level-zero edge`);
	}
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-reciprocal-'));
const databasePath = path.join(directory, 'reciprocal.awtsdb');
const rows = Array.from({ length: 96 }, (_, index) => ({
	id: `row-${index}`,
	vector: vectorFor(index)
}));
let database;

try {
	database = new AwtsmoosDB(databasePath, { compression: false });
	database.open();
	database.createList(database.root, 'records');
	database.root.records.splice(
		0,
		0,
		...rows.map(row => ({ id: row.id }))
	);
	database.waitForIdle();
	database.batch(() => {
		database.vector.metadata.create('records', {
			dimensions: 12,
			metric: 'cosine'
		});
		const index = database.vector.getIndex('records');
		index.M = 2;
		index.M0 = 2;
		index.efConstruction = 12;
		const soul = database.root.records[constants.SYMBOLS.INTERNALS];
		const iterator = createSourceIterator(database, soul);
		let position = 0;
		for (const item of iterator) {
			const row = rows[position++];
			index.insert(row.id, row.vector, item.pointer);
		}
		database.vector.persistIndex('records', index);
	});
	const index = database.vector.getIndex('records');
	assertInbound(index, rows.length);
	assertSelfQueries(database, rows, 'built');
	const audit = database.vector.auditIndex(database.root.records);
	assert(audit.ok, `graph audit failed: ${JSON.stringify(audit.errors)}`);
	database.close();
	database = new AwtsmoosDB(databasePath, { readOnly: true });
	database.open();
	assertSelfQueries(database, rows, 'reopened');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_reciprocal_connectivity_test PASS');
