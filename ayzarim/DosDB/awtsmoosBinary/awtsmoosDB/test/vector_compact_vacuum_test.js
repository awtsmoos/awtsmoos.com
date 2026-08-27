// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/vector_compact_vacuum_test.js
 * @chapter Vacuum Rebinds One Graph Without Restoring Duplicate Row Vectors
 * @description Proves compact payloads, tag decoding, destination pointer rebinding,
 * indexed ranking, audit, verifier, and read-only reopen after vacuum.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const rowCodec = require('../../../aiSearch/vectorCorpus/rowCodec.js');
const reader = require('../../../aiSearch/vectorCorpus/reader.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function decodedIds(database, query, count) {
	return reader.decodeHits(
		database,
		database.vector.nearestIndexed(database.root.records, query, count)
	).map(hit => hit.item.id);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-compact-vacuum-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const destinationPath = path.join(directory, 'destination.awtsdb');
const rows = [
	{ id: 'A', corpus: 'one', year: 5747, text: 'alpha', vec: [1, 0, 0, 0] },
	{ id: 'B', corpus: 'one', year: 5747, text: 'beta', vec: [0, 1, 0, 0] },
	{ id: 'C', corpus: 'two', year: 5748, text: 'gamma', vec: [0.9, 0.1, 0, 0] },
	{ id: 'D', corpus: 'two', year: 5748, text: 'delta', vec: [0, 0, 1, 0] }
];
const codec = rowCodec.create(rows, ['corpus', 'year']);
const encode = rowCodec.encoder(codec);
let source;
let destination;

try {
	source = new AwtsmoosDB(sourcePath, { compression: false });
	source.open();
	source.createList(source.root, 'records');
	source.root[reader.MANIFEST_KEY] = {
		version: 1,
		format: 'awtsmoos-compact-vector-corpus',
		listName: 'records',
		count: rows.length,
		dimensions: 4,
		vectorsStoredInPayloads: false,
		codec
	};
	source.vector.bulkLoadDetached(
		source.root.records,
		rows.map(row => ({ key: row.id, vector: row.vec, payload: encode(row) })),
		{ dimensions: 4 }
	);
	const expected = decodedIds(source, [1, 0, 0, 0], 3);
	source.close();
	source = null;

	const manifest = AwtsmoosDB.vacuumFile(sourcePath, destinationPath, {
		compression: false,
		cleanupOnFailure: true
	});
	const report = manifest.copyStats.rebuiltIndexes.vectorReports[0];
	assert(report.detached === true, 'vacuum did not use detached vector rebinding');
	assert(report.indexed === rows.length, 'vacuum lost compact vectors');

	destination = new AwtsmoosDB(destinationPath, { readOnly: true });
	destination.open();
	assert(decodedIds(destination, [1, 0, 0, 0], 3).join('|') === expected.join('|'), 'compact ranking changed after vacuum');
	assert(rowCodec.isCompact(destination.root.records[0]), 'compact payload shape was lost');
	const decoded = reader.decode(destination, destination.root.records[0]);
	assert(decoded.vec === undefined && decoded.corpus === 'one', 'vacuum restored a vector or lost tags');
	assert(destination.vector.auditIndex(destination.root.records).ok, 'compact destination graph audit failed');
	assert(destination.verify().ok, 'compact destination verification failed');
} finally {
	if (destination) destination.close();
	if (source) source.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_compact_vacuum_test PASS');
