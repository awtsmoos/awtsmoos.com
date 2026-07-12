// B"H

/**
 * @file test/vacuum_vector_index_test.js
 * @chapter The Destination Graph Must Contain Destination Nodes After Reopen
 * @description
 * Proves vacuum excludes source graph storage, rebuilds every vector record once,
 * persists registry pointers, passes exhaustive audit, and answers indexed search.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function ids(db, query, count) {
	return db.vector.nearestIndexed(db.root.records, query, count)
		.map(result => result.item.id);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-vector-vacuum-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const destinationPath = path.join(directory, 'candidate.awtsdb');
const rows = [
	{ id: 'A', vec: [1, 0, 0, 0], text: 'alpha' },
	{ id: 'B', vec: [0, 1, 0, 0], text: 'beta' },
	{ id: 'C', vec: [0.9, 0.1, 0, 0], text: 'gamma' },
	{ id: 'D', vec: [0, 0, 1, 0], text: 'delta' },
	{ id: 'E', vec: [0, 0, 0, 1], text: 'epsilon' }
];
let source;
let destination;

try {
	source = new AwtsmoosDB(sourcePath, { compression: false, reuseFreedSpace: false });
	source.open();
	source.createList(source.root, 'records');
	source.vector.bulkLoad(source.root.records, rows, { dimensions: 4, metric: 'cosine', chunkSize: 2 });
	source.root.discarded = Buffer.alloc(1024 * 1024, 18);
	delete source.root.discarded;
	const expected = [ids(source, [1, 0, 0, 0], 3), ids(source, [0, 1, 0, 0], 3)];
	source.close();
	source = null;

	const manifest = AwtsmoosDB.vacuumFile(sourcePath, destinationPath, { compression: false, cleanupOnFailure: true });
	const vectorReport = manifest.copyStats.rebuiltIndexes.vectorReports[0];
	assert(manifest.comparison.ok, 'vector vacuum semantic comparison failed');
	assert(manifest.copyStats.rebuiltIndexes.vectors === 1, 'destination vector graph was not rebuilt once');
	assert(vectorReport.indexed === rows.length, 'vacuum did not index every destination record');
	assert(vectorReport.status.usable, 'vacuum reported an unusable destination graph');

	source = new AwtsmoosDB(sourcePath, { readOnly: true });
	destination = new AwtsmoosDB(destinationPath, { readOnly: true });
	source.open();
	destination.open();
	const audit = destination.vector.auditIndex(destination.root.records);
	assert(audit.ok && audit.registryCount === rows.length, `destination graph audit failed: ${JSON.stringify(audit.errors)}`);
	assert(JSON.stringify(destination.vector.configurations()) === JSON.stringify(source.vector.configurations()), 'vector configuration changed');
	assert(JSON.stringify(ids(destination, [1, 0, 0, 0], 3)) === JSON.stringify(expected[0]), 'first indexed ranking changed');
	assert(JSON.stringify(ids(destination, [0, 1, 0, 0], 3)) === JSON.stringify(expected[1]), 'second indexed ranking changed');
	assert(destination.verify().ok, 'destination vector allocations did not verify');
	assert(source.semanticDigest() === destination.semanticDigest(), 'vector-aware semantic digest changed');
} finally {
	if (destination) destination.close();
	if (source) source.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vacuum_vector_index_test PASS');
