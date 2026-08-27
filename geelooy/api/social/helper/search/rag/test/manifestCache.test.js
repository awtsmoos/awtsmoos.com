// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file manifestCache.test.js
 * @description
 * Proves manifest clones, fingerprint invalidation, and bounded memory. The
 * Awtsmoos lets Awtsmoos.com remember unchanged JSON without preserving stale
 * revelation or writing one extra byte beside the canonical databases.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
	clearManifestCache,
	manifestCacheSize,
	readManifest
} = require('../manifestCache.js');

function temporaryFolder() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-manifest-cache-'));
}

function writeAtomic(file, value) {
	const temporary = `${file}.next`;
	fs.writeFileSync(temporary, JSON.stringify(value));
	fs.renameSync(temporary, file);
}

test('returns clones and invalidates after atomic replacement', () => {
	clearManifestCache();
	const folder = temporaryFolder();
	const file = path.join(folder, 'shard.fast-manifest.json');
	writeAtomic(file, { id: 'first', records: 1 });
	const first = readManifest(file);
	first.id = 'mutated';
	assert.equal(readManifest(file).id, 'first');
	writeAtomic(file, { id: 'second', records: 2 });
	assert.deepEqual(readManifest(file), { id: 'second', records: 2 });
	fs.rmSync(folder, { recursive: true, force: true });
});

test('evicts old manifests and forgets missing files', () => {
	clearManifestCache();
	const folder = temporaryFolder();
	const files = [1, 2, 3].map(number => {
		const file = path.join(folder, `${number}.json`);
		writeAtomic(file, { number });
		return file;
	});
	for (const file of files) readManifest(file, 2);
	assert.equal(manifestCacheSize(), 2);
	fs.unlinkSync(files[2]);
	assert.equal(readManifest(files[2], 2), null);
	assert.equal(manifestCacheSize(), 1);
	fs.rmSync(folder, { recursive: true, force: true });
});
