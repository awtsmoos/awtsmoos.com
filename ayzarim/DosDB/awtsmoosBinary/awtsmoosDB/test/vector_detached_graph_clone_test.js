// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/vector_detached_graph_clone_test.js
 * @chapter Thousands Of Keys Must Cross Beneath One Durability Boundary
 * @description Proves topology, vectors, canonical keys, new payload pointers,
 * strict ranking, verifier/audit, reopen, and exactly one graph idle boundary.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const helpers = require('./vector_detached_graph_clone_helpers.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-graph-clone-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const destinationPath = path.join(directory, 'destination.awtsdb');
const rows = helpers.rows();
let source;
let destination;

try {
	source = new AwtsmoosDB(sourcePath, { compression: false });
	source.open();
	source.createList(source.root, 'records');
	source.vector.bulkLoad(source.root.records, rows, { dimensions: 4 });
	const sourceSnapshot = helpers.snapshot(source, source.root.records);
	const expectedTopology = helpers.topology(sourceSnapshot);
	const expectedIds = helpers.nearestIds(source, source.root.records);

	destination = new AwtsmoosDB(destinationPath, { compression: false });
	destination.open();
	destination.createList(destination.root, 'records');
	destination.root.records.splice(
		0,
		0,
		...rows.map(({ vec, ...row }) => row)
	);
	destination.waitForIdle();
	const originalWait = destination.waitForIdle.bind(destination);
	let idleBoundaries = 0;
	destination.waitForIdle = options => {
		idleBoundaries++;
		return originalWait(options);
	};
	const report = destination.vector.cloneDetachedGraph(
		destination.root.records,
		sourceSnapshot,
		rows.map(row => row.id),
		{ dimensions: 4 }
	);
	destination.waitForIdle = originalWait;
	assert(idleBoundaries === 1, `graph clone used ${idleBoundaries} idle boundaries`);
	assert(report.durabilityBoundaries === 1, 'clone report lost boundary count');
	const actualTopology = helpers.topology(
		helpers.snapshot(destination, destination.root.records)
	);
	assert(
		JSON.stringify(actualTopology) === JSON.stringify(expectedTopology),
		'graph topology changed'
	);
	assert(
		JSON.stringify(helpers.nearestIds(destination, destination.root.records))
			=== JSON.stringify(expectedIds),
		'graph clone ranking changed'
	);
	assert(destination.root.records[0].vec === undefined, 'payload duplicated vector');
	assert(destination.vector.auditIndex(destination.root.records).ok, 'audit failed');
	assert(destination.verify().ok, 'verification failed');
	destination.close();
	destination = new AwtsmoosDB(destinationPath, { readOnly: true });
	destination.open();
	assert(destination.vector.auditIndex(destination.root.records).ok, 'reopen audit failed');
} finally {
	if (destination) destination.close();
	if (source) source.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_detached_graph_clone_test PASS');
