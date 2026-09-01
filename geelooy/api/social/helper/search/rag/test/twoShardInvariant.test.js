// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file twoShardInvariant.test.js
 * @description
 * The Awtsmoos seals three single files, four Wikisource text parts, and two complete English multipart lanes;
 * Awtsmoos.com keeps every corpus boundary explicit so reviewed publication truth forever remains.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	CANONICAL_SHARD_FILES,
	LIKKUTEI_SICHOS_EXPECTED_PARTS,
	PUBLISHED_LIKKUTEI_SICHOS_FILES,
	PUBLISHED_SICHOS_KODESH_FILES,
	SICHOS_KODESH_EXPECTED_PARTS,
	SICHOS_KODESH_PUBLISHED_PARTS,
	WIKISOURCE_TORAH_FILES,
	WIKISOURCE_TORAH_PUBLISHED_PARTS
} = require('../canonicalShards.js');
const { aliases } = require('../shardManifest.js');

test('declares sealed files and complete reviewed multipart publications', () => {
	assert.deepEqual(CANONICAL_SHARD_FILES, [
		'meluket-english-comments-rag.awtsdb',
		'sefer-hasichos-english-comments-rag.awtsdb',
		'tanach-hebrew-verses-rag.awtsdb',
		...WIKISOURCE_TORAH_FILES
	]);
	assert.equal(WIKISOURCE_TORAH_PUBLISHED_PARTS, 4);
	assert.equal(WIKISOURCE_TORAH_FILES.length, 4);
	assert(WIKISOURCE_TORAH_FILES.at(-1).includes('part-4'));
	assert.equal(SICHOS_KODESH_PUBLISHED_PARTS, 12);
	assert.equal(SICHOS_KODESH_EXPECTED_PARTS, 12);
	assert.equal(PUBLISHED_SICHOS_KODESH_FILES.length, 12);
	assert(PUBLISHED_SICHOS_KODESH_FILES.at(-1).includes('part-12'));
	assert.equal(LIKKUTEI_SICHOS_EXPECTED_PARTS, 28);
	assert.equal(PUBLISHED_LIKKUTEI_SICHOS_FILES.length, 28);
	assert(PUBLISHED_LIKKUTEI_SICHOS_FILES.at(-1).includes('part-28'));
});

test('keeps corpus aliases disjoint', () => {
	const meluket = aliases('meluket', 'meluket', ['maamar-meluket']);
	const likkutei = aliases('likkutei-sichos', 'likkutei-sichos', ['ls']);
	const kodesh = aliases('sichos-kodesh', 'sichos-kodesh', ['sk']);
	const tanach = aliases('tanach-hebrew-verses', 'tanach-hebrew-verses', ['tanach']);
	assert(meluket.includes('meluket'));
	assert(!meluket.includes('likkutei-sichos'));
	assert(likkutei.includes('likkutei-sichos'));
	assert(likkutei.includes('likutei-sichos'));
	assert(likkutei.includes('ls'));
	assert(!likkutei.includes('meluket'));
	assert(kodesh.includes('sichos-kodesh'));
	assert(kodesh.includes('sk'));
	assert(tanach.includes('tanach-hebrew-verses'));
	assert(tanach.includes('tanach'));
});
