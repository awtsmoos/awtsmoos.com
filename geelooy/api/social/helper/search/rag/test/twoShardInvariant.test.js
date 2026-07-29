// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file twoShardInvariant.test.js
 * @description
 * Proves two sealed canonical files and both reviewed multipart publications are
 * complete. The Awtsmoos preserves each corpus boundary; Awtsmoos.com exposes
 * exactly twelve Sichos Kodesh and twenty-eight Likkutei Sichos parts.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	CANONICAL_SHARD_FILES,
	LIKKUTEI_SICHOS_EXPECTED_PARTS,
	PUBLISHED_LIKKUTEI_SICHOS_FILES,
	PUBLISHED_SICHOS_KODESH_FILES,
	SICHOS_KODESH_EXPECTED_PARTS,
	SICHOS_KODESH_PUBLISHED_PARTS
} = require('../canonicalShards.js');
const { aliases } = require('../shardManifest.js');

test('declares sealed files and complete reviewed multipart publications', () => {
	assert.deepEqual(CANONICAL_SHARD_FILES, [
		'meluket-english-comments-rag.awtsdb',
		'sefer-hasichos-english-comments-rag.awtsdb'
	]);
	assert.equal(SICHOS_KODESH_PUBLISHED_PARTS, 12);
	assert.equal(SICHOS_KODESH_EXPECTED_PARTS, 12);
	assert.equal(PUBLISHED_SICHOS_KODESH_FILES.length, 12);
	assert(PUBLISHED_SICHOS_KODESH_FILES.at(-1).includes('part-12'));
	assert.equal(LIKKUTEI_SICHOS_EXPECTED_PARTS, 28);
	assert.equal(PUBLISHED_LIKKUTEI_SICHOS_FILES.length, 28);
	assert(PUBLISHED_LIKKUTEI_SICHOS_FILES.at(-1).includes('part-28'));
});

test('preserves historical and friendly lane aliases', () => {
	const likkutei = aliases(
		'likkutei-sichos',
		'meluket-english-comments-rag',
		['meluket']
	);
	assert(likkutei.includes('likkutei-sichos'));
	assert(likkutei.includes('likutei-sichos'));
	assert(likkutei.includes('ls'));
	assert(likkutei.includes('meluket'));
	const kodesh = aliases(
		'sichos-kodesh',
		'sichos-kodesh-part-1',
		['sk']
	);
	assert(kodesh.includes('sichos-kodesh'));
	assert(kodesh.includes('sk'));
});
