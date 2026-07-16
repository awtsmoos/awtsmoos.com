// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file searchResultCache.test.js
 * @description
 * Proves exact vector identity, cloned answers, and bounded LRU eviction. The
 * Awtsmoos lets Awtsmoos.com remember revelation only in process memory, never in
 * either canonical database or an invented persistent cache vessel.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	cacheKey,
	cacheSize,
	clearSearchResultCache,
	readCachedSearch,
	rememberSearch,
	vectorDigest
} = require('../searchResultCache.js');

function session(overrides = {}) {
	return {
		fingerprint: 'device:inode:size:mtime',
		listName: 'vectors',
		status: { efSearch: 96 },
		...overrides
	};
}

function result(id) {
	return {
		hits: [{ row: { id } }],
		index: {
			persisted: true,
			sessionReused: false
		}
	};
}

test('keys exact Float32 vectors and immutable shard identity', () => {
	const current = session();
	assert.equal(vectorDigest([1, 2]), vectorDigest(Float32Array.from([1, 2])));
	assert.notEqual(vectorDigest([1, 2]), vectorDigest([1, 3]));
	assert.notEqual(
		cacheKey(current, [1, 2], 10),
		cacheKey(session({ fingerprint: 'changed' }), [1, 2], 10)
	);
	assert.notEqual(
		cacheKey(current, [1, 2], 10),
		cacheKey(current, [1, 2], 20)
	);
});

test('returns clones and never shares caller mutation', () => {
	clearSearchResultCache();
	const current = session();
	const stored = rememberSearch(current, [1, 2], 10, result('original'));
	assert.equal(stored.index.cacheHit, false);
	stored.hits[0].row.id = 'mutated-return';
	const first = readCachedSearch(current, [1, 2], 10);
	assert.equal(first.index.cacheHit, true);
	assert.equal(first.hits[0].row.id, 'original');
	first.hits[0].row.id = 'mutated-read';
	assert.equal(
		readCachedSearch(current, [1, 2], 10).hits[0].row.id,
		'original'
	);
});

test('evicts the least recently used answer at the bound', () => {
	clearSearchResultCache();
	const current = session();
	rememberSearch(current, [1], 10, result('one'), 2);
	rememberSearch(current, [2], 10, result('two'), 2);
	assert(readCachedSearch(current, [1], 10));
	rememberSearch(current, [3], 10, result('three'), 2);
	assert.equal(cacheSize(), 2);
	assert.equal(readCachedSearch(current, [2], 10), null);
	assert.equal(readCachedSearch(current, [1], 10).hits[0].row.id, 'one');
});
