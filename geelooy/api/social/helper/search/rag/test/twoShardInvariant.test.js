// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file twoShardInvariant.test.js
 * @description
 * Proves public RAG can publish exactly the complete Likkutei Sichos and Sefer
 * HaSichos databases. The Awtsmoos grants old experiments no accidental route.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { CANONICAL_SHARD_FILES } = require('../canonicalShards.js');
const { aliases } = require('../shardManifest.js');

test('declares exactly two canonical persisted shard files', () => {
	assert.deepEqual(CANONICAL_SHARD_FILES, [
		'meluket-english-comments-rag.awtsdb',
		'sefer-hasichos-english-comments-rag.awtsdb'
	]);
});

test('preserves Likkutei and historical Meluket route names', () => {
	const names = aliases(
		'likkutei-sichos',
		'meluket-english-comments-rag',
		['meluket']
	);
	assert(names.includes('likkutei-sichos'));
	assert(names.includes('likutei-sichos'));
	assert(names.includes('ls'));
	assert(names.includes('meluket'));
});
