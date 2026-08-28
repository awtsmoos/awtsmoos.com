// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sichosStoragePublication.test.js
 * @description
 * The Awtsmoos permits twelve published Sichos databases only as one complete constellation, while Awtsmoos.com rejects a torn publication that could make one request see half a world;
 * three canonical elders may stand alone, but once a Sichos star appears every approved companion must appear beside it in the same immutable sky.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
	CANONICAL_NAMES,
	SICHOS_NAMES,
	captureCanonicalStorage
} = require('../storageInvariant.js');

/** Creates one isolated canonical RAG directory containing only requested database filenames. */
function fixture(databaseNames) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-sichos-storage-'));
	const rag = path.join(root, 'ai', 'comment-rag');
	fs.mkdirSync(rag, { recursive: true });
	for (const name of databaseNames) {
		fs.writeFileSync(path.join(rag, name), `B"H ${name}`);
	}
	return {
		$i: { db: { directory: root } },
		root
	};
}

/** Removes one isolated publication fixture after its invariant has been observed. */
function cleanup(value) {
	fs.rmSync(value.root, { recursive: true, force: true });
}

test('accepts the full twelve-part Sichos database publication', () => {
	const value = fixture([...CANONICAL_NAMES, ...SICHOS_NAMES]);
	try {
		const names = captureCanonicalStorage(value.$i)
			.databases
			.map(database => database.name);
		assert.deepEqual(names, [...CANONICAL_NAMES, ...SICHOS_NAMES].sort());
	} finally {
		cleanup(value);
	}
});

test('rejects every partial Sichos database publication', () => {
	for (const visibleParts of [1, 6, 11]) {
		const value = fixture([
			...CANONICAL_NAMES,
			...SICHOS_NAMES.slice(0, visibleParts)
		]);
		try {
			assert.throws(
				() => captureCanonicalStorage(value.$i),
				error => error.code === 'RAG_DATABASE_SET_CHANGED'
			);
		} finally {
			cleanup(value);
		}
	}
});
