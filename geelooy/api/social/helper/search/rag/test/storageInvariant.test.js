// B"H

/**
 * @file storageInvariant.test.js
 * @description Proves the reviewed shard set remains immutable and rejects every unknown database or sidecar.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { CANONICAL_NAMES, assertStorageUnchanged, captureCanonicalStorage } = require('../storageInvariant.js');

function productionFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-rag-storage-'));
	const rag = path.join(root, 'ai', 'comment-rag');
	fs.mkdirSync(rag, { recursive: true });
	for (const name of CANONICAL_NAMES) fs.writeFileSync(path.join(rag, name), `B"H ${name}`);
	return { $i: { db: { directory: root } }, rag, root };
}

function cleanup(fixture) {
	fs.rmSync(fixture.root, { recursive: true, force: true });
}

test('captures every reviewed immutable database', () => {
	const fixture = productionFixture();
	const snapshot = captureCanonicalStorage(fixture.$i);
	assert.deepEqual(snapshot.databases.map(database => database.name), CANONICAL_NAMES);
	assertStorageUnchanged(snapshot, captureCanonicalStorage(fixture.$i));
	cleanup(fixture);
});

test('rejects an unknown top-level database', () => {
	const fixture = productionFixture();
	fs.writeFileSync(path.join(fixture.rag, 'forbidden.awtsdb'), 'no');
	assert.throws(() => captureCanonicalStorage(fixture.$i), error => error.code === 'RAG_DATABASE_SET_CHANGED');
	cleanup(fixture);
});

test('rejects write sidecars', () => {
	for (const suffix of ['wal', 'journal', 'lock', 'tmp']) {
		const fixture = productionFixture();
		fs.writeFileSync(path.join(fixture.rag, `${CANONICAL_NAMES[0]}.${suffix}`), 'forbidden');
		assert.throws(() => captureCanonicalStorage(fixture.$i), error => error.code === 'RAG_WRITE_SIDECAR_PRESENT');
		cleanup(fixture);
	}
});

test('rejects shard growth during one request', () => {
	const fixture = productionFixture();
	const before = captureCanonicalStorage(fixture.$i);
	fs.appendFileSync(path.join(fixture.rag, CANONICAL_NAMES[1]), ' growth');
	assert.throws(() => assertStorageUnchanged(before, captureCanonicalStorage(fixture.$i)), error => error.code === 'RAG_STORAGE_MUTATED_DURING_SEARCH');
	cleanup(fixture);
});
