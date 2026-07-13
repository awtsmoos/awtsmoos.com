// B"H

/**
 * @file test/vector_verified_complement_test.js
 * @chapter Every Live VN01 Body Remains Outside The Verified Void
 * @description Proves custom-node reachability, payload traversal, mutation, and reopen persistence.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const SmartPointer = require('../utils/smartPointer.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function vectorFor(index, phase = 0, dimensions = 16) {
	const values = [];
	let sum = 0;
	for (let dimension = 0; dimension < dimensions; dimension++) {
		const value = ((index + 3) * (dimension + 5) * (phase + 7) % 991) / 991
			+ (dimension === (index + phase) % dimensions ? 1 : 0);
		values.push(value);
		sum += value * value;
	}
	const norm = Math.sqrt(sum) || 1;
	return values.map(value => value / norm);
}

function row(index, phase = 0) {
	return {
		id: `row-${index}-p${phase}`,
		vec: vectorFor(index, phase)
	};
}

function verifyRegistry(db, label) {
	const index = db.vector.getIndex(db.root.records);
	index.registry.init();
	const report = db.verify();
	assert(report.ok, `${label} verifier failed`);
	for (const seal of index.registry._ptrs) {
		const pointer = SmartPointer.decode(seal);
		assert(pointer, `${label} registry pointer is missing`);
		for (const range of report.free) {
			const overlaps = pointer.offset < range.offset + range.length
				&& range.offset < pointer.offset + pointer.length;
			assert(!overlaps, `${label} live vector node was classified as free`);
		}
	}
	const audit = db.vector.auditIndex(db.root.records);
	assert(audit.ok, `${label} vector audit failed: ${JSON.stringify(audit.errors)}`);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-vector-complement-'));
const dbPath = path.join(directory, 'vectors.awtsdb');
const count = 120;
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.createList(db.root, 'records');
	db.vector.bulkLoad(
		db.root.records,
		Array.from({ length: count }, (_, index) => row(index)),
		{ dimensions: 16, metric: 'cosine' }
	);
	db.waitForIdle();
	verifyRegistry(db, 'built');
	db.batch(() => {
		for (let index = 0; index < count; index += 10) db.root.records[index] = row(index, 1);
	});
	verifyRegistry(db, 'updated');
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { readOnly: true });
	db.open();
	verifyRegistry(db, 'reopened');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vector_verified_complement_test PASS');
