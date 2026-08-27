// B"H

/**
 * @file test/vector_bulk_load_test.js
 * @chapter The Graph Must Survive The Closing Of The Vessel
 * @description
 * Proves bounded loading, one final rebuild, strict indexed queries, exhaustive
 * graph audit, reopen persistence, and refusal to mix a second bulk generation.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function indexedIds(db) {
	return db.vector.nearestIndexed(db.root.records, [1, 0, 0, 0], 2)
		.map(result => result.item.id);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-vector-bulk-'));
const dbPath = path.join(directory, 'bulk.awtsdb');
const rows = [
	{ id: 'A', vec: [1, 0, 0, 0], text: 'alpha' },
	{ id: 'B', vec: [0, 1, 0, 0], text: 'beta' },
	{ id: 'C', vec: [0.9, 0.1, 0, 0], text: 'gamma' },
	{ id: 'D', vec: [0, 0, 1, 0], text: 'delta' }
];
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.createList(db.root, 'records');
	let rebuilds = 0;
	const originalRun = db.vector.reindexer.run.bind(db.vector.reindexer);
	db.vector.reindexer.run = (...argumentsList) => {
		rebuilds++;
		return originalRun(...argumentsList);
	};
	const report = db.vector.bulkLoad(db.root.records, rows, {
		dimensions: 4,
		metric: 'cosine',
		chunkSize: 2
	});
	const rebuildReport = db.vector.lastReindexReport(db.root.records);
	assert(report.loaded === rows.length, 'bulk load count mismatch');
	assert(report.rebuilds === 1 && rebuilds === 1, 'bulk load did not rebuild exactly once');
	assert(rebuildReport.indexed === rows.length, 'reindex did not consume every vector record');
	assert(JSON.stringify(indexedIds(db)) === JSON.stringify(['A', 'C']), 'indexed ordering changed before close');
	assert(db.vector.auditIndex(db.root.records).ok, 'graph audit failed before close');
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { readOnly: true });
	db.open();
	const audit = db.vector.auditIndex(db.root.records);
	assert(audit.ok && audit.registryCount === rows.length, `reopened graph audit failed: ${JSON.stringify(audit.errors)}`);
	assert(JSON.stringify(indexedIds(db)) === JSON.stringify(['A', 'C']), 'indexed ordering changed after reopen');
	let refused = false;
	try { db.vector.bulkLoad(db.root.records, [], { dimensions: 4 }); }
	catch (error) { refused = error.code === 'AWTSMOOS_DB_VECTOR_BULK_ALREADY_INDEXED'; }
	assert(refused, 'bulk load mixed with an existing derived graph');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_bulk_load_test PASS');
