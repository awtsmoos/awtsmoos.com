// B"H

/**
 * @file test/indexed_restart_mutation_test.js
 * @chapter Replaced And Shifted Records Leave No Stale Search Or Vector Names
 * @description Proves strict search, HNSW reconciliation, verified reuse, and restart persistence.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function ids(rows) {
	return rows.map(row => row.id);
}

function verifyIndexed(db, label) {
	const audit = db.vector.auditIndex(db.root.records);
	assert(audit.ok, `${label} vector audit failed: ${JSON.stringify(audit.errors)}`);
	assert(db.verify().ok, `${label} allocation verification failed`);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-indexed-restart-'));
const dbPath = path.join(directory, 'indexed.awtsdb');
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.createList(db.root, 'records');
	db.root.records.push(
		{ id: 'a', text: 'alpha cedar', vec: [1, 0, 0, 0] },
		{ id: 'b', text: 'beta maple', vec: [0, 1, 0, 0] },
		{ id: 'c', text: 'gamma pine', vec: [0, 0, 1, 0] }
	);
	db.search.enable(db.root.records);
	db.vector.enable(db.root.records, { dimensions: 4, metric: 'cosine' });
	db.waitForIdle();
	verifyIndexed(db, 'initial');
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	assert(db.sysCache.search.has('records'), 'search mutation cache was not restored');
	assert(db.sysCache.vector.has('records'), 'vector mutation cache was not restored');
	db.root.records[0] = { id: 'a2', text: 'omega birch', vec: [0, 0, 0, 1] };
	db.root.records.push({ id: 'd', text: 'delta cedar', vec: [0.95, 0.05, 0, 0] });
	db.root.records.splice(1, 1);
	db.waitForIdle();
	verifyIndexed(db, 'mutated');
	assert(JSON.stringify(ids(db.search.runIndexed(db.root.records, 'omega'))) === JSON.stringify(['a2']), 'new token missing');
	assert(JSON.stringify(ids(db.search.runIndexed(db.root.records, 'cedar'))) === JSON.stringify(['d']), 'stale cedar posting remained');
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { readOnly: true });
	db.open();
	verifyIndexed(db, 'reopened');
	assert(JSON.stringify(ids(db.search.runIndexed(db.root.records, 'cedar'))) === JSON.stringify(['d']), 'reopened search changed');
	assert(db.vector.nearestIndexed(db.root.records, [0, 0, 0, 1], 1)[0].item.id === 'a2', 'reopened HNSW result changed');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H indexed_restart_mutation_test PASS');
