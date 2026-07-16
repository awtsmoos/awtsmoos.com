// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file storageInvariant.test.js
 * @description
 * Proves that Awtsmoos.com accepts exactly two canonical databases and rejects a
 * third shard, write sidecars, or byte mutation during one search revelation.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
	CANONICAL_NAMES,
	assertStorageUnchanged,
	captureCanonicalStorage
} = require('../storageInvariant.js');

function productionFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-rag-storage-'));
	const rag = path.join(root, 'ai', 'comment-rag');
	fs.mkdirSync(rag, { recursive: true });
	for (const name of CANONICAL_NAMES) {
		fs.writeFileSync(path.join(rag, name), `B"H ${name}`);
	}
	return {
		$i: { db: { directory: root } },
		rag,
		root
	};
}

function cleanup(fixture) {
	fs.rmSync(fixture.root, { recursive: true, force: true });
}

test('captures exactly two immutable canonical databases', () => {
	const fixture = productionFixture();
	const snapshot = captureCanonicalStorage(fixture.$i);
	assert.deepEqual(
		snapshot.databases.map(database => database.name),
		CANONICAL_NAMES
	);
	assertStorageUnchanged(snapshot, captureCanonicalStorage(fixture.$i));
	cleanup(fixture);
});

test('rejects a third top-level database', () => {
	const fixture = productionFixture();
	fs.writeFileSync(path.join(fixture.rag, 'forbidden-third.awtsdb'), 'no');
	assert.throws(
		() => captureCanonicalStorage(fixture.$i),
		error => error.code === 'RAG_DATABASE_SET_CHANGED'
	);
	cleanup(fixture);
});

test('rejects WAL, journal, lock, and temporary database sidecars', () => {
	for (const suffix of ['wal', 'journal', 'lock', 'tmp']) {
		const fixture = productionFixture();
		fs.writeFileSync(
			path.join(fixture.rag, `${CANONICAL_NAMES[0]}.${suffix}`),
			'forbidden'
		);
		assert.throws(
			() => captureCanonicalStorage(fixture.$i),
			error => error.code === 'RAG_WRITE_SIDECAR_PRESENT'
		);
		cleanup(fixture);
	}
});

test('rejects canonical shard growth during one request', () => {
	const fixture = productionFixture();
	const before = captureCanonicalStorage(fixture.$i);
	fs.appendFileSync(path.join(fixture.rag, CANONICAL_NAMES[1]), ' growth');
	const after = captureCanonicalStorage(fixture.$i);
	assert.throws(
		() => assertStorageUnchanged(before, after),
		error => error.code === 'RAG_STORAGE_MUTATED_DURING_SEARCH'
	);
	cleanup(fixture);
});