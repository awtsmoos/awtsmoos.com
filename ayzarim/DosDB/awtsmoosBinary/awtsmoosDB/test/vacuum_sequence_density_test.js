// B"H

/**
 * @file test/vacuum_sequence_density_test.js
 * @chapter A Thousand Records Remain A River Instead Of One Bloated Stone
 * @description
 * Locks vacuum to bounded sequence copy and proves named list metadata survives,
 * so density cannot regress into whole-list assignment or semantic loss.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-sequence-density-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const destinationPath = path.join(directory, 'candidate.awtsdb');
let db;

try {
	db = new AwtsmoosDB(sourcePath, { compression: false, reuseFreedSpace: false });
	db.open();
	db.createList(db.root, 'records');
	for (let offset = 0; offset < 600; offset += 50) {
		const rows = [];
		for (let index = offset; index < offset + 50; index++) {
			rows.push({
				id: `row-${index}`,
				text: `reachable record ${index}`,
				vec: Array.from({ length: 32 }, (_unused, dimension) => (index + dimension) / 1000)
			});
		}
		db.root.records.splice(db.root.records.length, 0, ...rows);
	}
	db.root.records.label = 'canonical-sequence-metadata';
	db.root.records.settings = { dimensions: 32, metric: 'cosine' };
	db.root.discarded = Buffer.alloc(2 * 1024 * 1024, 41);
	delete db.root.discarded;
	db.close();
	db = null;

	const manifest = AwtsmoosDB.vacuumFile(sourcePath, destinationPath, {
		compression: false,
		listChunkSize: 50,
		cleanupOnFailure: true
	});
	const strategy = manifest.copyStats.rootStrategies.records;
	assert(strategy.strategy === 'bounded-sequence-copy', 'root list used whole-value assignment');
	assert(strategy.records === 600, 'bounded copy record count mismatch');
	assert(strategy.chunkSize === 50, 'bounded copy chunk size mismatch');
	assert(strategy.properties === 2, 'named sequence property count mismatch');
	assert(manifest.destination.size < manifest.source.size, 'vacuum did not remove deliberate bloat');
	assert(manifest.comparison.ok, 'bounded sequence candidate comparison failed');

	db = new AwtsmoosDB(destinationPath, { readOnly: true });
	db.open();
	assert(db.root.records.label === 'canonical-sequence-metadata', 'named list label was lost');
	assert(db.root.records.settings.dimensions === 32, 'named list object metadata was lost');
	assert(db.root.records.length === 600, 'destination list length changed');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vacuum_sequence_density_test PASS');
