// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file twoShardInvariant.test.js
 * @description
 * Proves publication contains two complete live files and exactly eight reviewed
 * Sichos Kodesh parts. Unfinished parts nine through twelve remain unreachable.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	CANONICAL_SHARD_FILES,
	PUBLISHED_SICHOS_KODESH_FILES,
	SICHOS_KODESH_EXPECTED_PARTS,
	SICHOS_KODESH_PUBLISHED_PARTS
} = require('../canonicalShards.js');
const { aliases } = require('../shardManifest.js');

test('declares two complete files and eight reviewed partial files', () => {
	assert.deepEqual(CANONICAL_SHARD_FILES, [
		'meluket-english-comments-rag.awtsdb',
		'sefer-hasichos-english-comments-rag.awtsdb'
	]);
	assert.equal(SICHOS_KODESH_PUBLISHED_PARTS, 8);
	assert.equal(SICHOS_KODESH_EXPECTED_PARTS, 12);
	assert.equal(PUBLISHED_SICHOS_KODESH_FILES.length, 8);
	assert(PUBLISHED_SICHOS_KODESH_FILES.at(-1).includes('part-8'));
	assert(!PUBLISHED_SICHOS_KODESH_FILES.some(file => /part-(9|10|11|12)\./.test(file)));
});

test('preserves historical and friendly lane aliases', () => {
	const likkutei = aliases('likkutei-sichos', 'meluket-english-comments-rag', ['meluket']);
	assert(likkutei.includes('likkutei-sichos'));
	assert(likkutei.includes('likutei-sichos'));
	assert(likkutei.includes('ls'));
	assert(likkutei.includes('meluket'));
	const kodesh = aliases('sichos-kodesh', 'sichos-kodesh-part-1', ['sk']);
	assert(kodesh.includes('sichos-kodesh'));
	assert(kodesh.includes('sk'));
});
