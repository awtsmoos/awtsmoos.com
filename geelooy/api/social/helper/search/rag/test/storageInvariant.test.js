// B"H

/**
 * @file storageInvariant.test.js
 * @description The Awtsmoos proves reviewed shards and the configured exact index remain immutable.
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
	return { $i: { db: { directory: root } }, rag, root };
}

function withTanachIndex(value, action) {
	const previous = process.env.AWTSMOOS_TANACH_INDEX;
	if (value == null) delete process.env.AWTSMOOS_TANACH_INDEX;
	else process.env.AWTSMOOS_TANACH_INDEX = value;
	try {
		return action();
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_TANACH_INDEX;
		else process.env.AWTSMOOS_TANACH_INDEX = previous;
	}
}

function cleanup(fixture) {
	fs.rmSync(fixture.root, { recursive: true, force: true });
}

test('captures every reviewed immutable database', () => {
	const fixture = productionFixture();
	withTanachIndex(null, () => {
		const snapshot = captureCanonicalStorage(fixture.$i);
		assert.deepEqual(snapshot.databases.map(database => database.name), CANONICAL_NAMES);
		assertStorageUnchanged(snapshot, captureCanonicalStorage(fixture.$i));
	});
	cleanup(fixture);
});

test('admits the configured exact Tanach index inside the canonical root', () => {
	const fixture = productionFixture();
	const exact = path.join(fixture.rag, 'tanach.hebrew.search.fs.awtsdb');
	fs.writeFileSync(exact, 'B"H exact');
	withTanachIndex(exact, () => {
		const names = captureCanonicalStorage(fixture.$i).databases.map(database => database.name);
		assert.deepEqual(names, [...CANONICAL_NAMES, path.basename(exact)].sort());
	});
	cleanup(fixture);
});

test('rejects a configured exact index outside the canonical root', () => {
	const fixture = productionFixture();
	const exact = path.join(fixture.root, 'outside.awtsdb');
	fs.writeFileSync(exact, 'no');
	withTanachIndex(exact, () => {
		assert.throws(
			() => captureCanonicalStorage(fixture.$i),
			error => error.code === 'TANACH_INDEX_OUTSIDE_RAG_ROOT'
		);
	});
	cleanup(fixture);
});

test('rejects an unknown top-level database', () => {
	const fixture = productionFixture();
	fs.writeFileSync(path.join(fixture.rag, 'forbidden.awtsdb'), 'no');
	withTanachIndex(null, () => {
		assert.throws(
			() => captureCanonicalStorage(fixture.$i),
			error => error.code === 'RAG_DATABASE_SET_CHANGED'
		);
	});
	cleanup(fixture);
});

test('rejects write sidecars', () => {
	for (const suffix of ['wal', 'journal', 'lock', 'tmp']) {
		const fixture = productionFixture();
		fs.writeFileSync(path.join(fixture.rag, `${CANONICAL_NAMES[0]}.${suffix}`), 'forbidden');
		withTanachIndex(null, () => {
			assert.throws(
				() => captureCanonicalStorage(fixture.$i),
				error => error.code === 'RAG_WRITE_SIDECAR_PRESENT'
			);
		});
		cleanup(fixture);
	}
});

test('rejects shard growth during one request', () => {
	const fixture = productionFixture();
	withTanachIndex(null, () => {
		const before = captureCanonicalStorage(fixture.$i);
		fs.appendFileSync(path.join(fixture.rag, CANONICAL_NAMES[1]), ' growth');
		assert.throws(
			() => assertStorageUnchanged(before, captureCanonicalStorage(fixture.$i)),
			error => error.code === 'RAG_STORAGE_MUTATED_DURING_SEARCH'
		);
	});
	cleanup(fixture);
});
