// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file responseCache.test.js
 * @description Proves public, bounded, fingerprinted process-memory reuse.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const cache = require('../responseCache.js');

function options(overrides = {}) {
	return {
		includeComments: false,
		limit: 2,
		query: 'Torah',
		requireIndexed: true,
		strategy: 'vector',
		...overrides
	};
}

function shard(overrides = {}) {
	return {
		aliases: ['likkutei-sichos'],
		bytes: 100,
		count: 2,
		dimensions: 384,
		id: 'likkutei-sichos',
		listName: 'vectors',
		title: 'Likkutei Sichos',
		...overrides
	};
}

function storage(size = 100) {
	return {
		databases: [{
			dev: 1,
			ino: 2,
			mtimeMs: 3,
			name: 'canonical.awtsdb',
			size
		}]
	};
}

function response(id = 'original') {
	return {
		hits: [{ row: { id } }],
		index: { persisted: true },
		timings: { totalMs: 10 }
	};
}

test('returns isolated public JSON clones', () => {
	cache.clearResponseCache();
	const request = options();
	const selected = shard();
	const snapshot = storage();
	assert(cache.rememberResponse(request, selected, snapshot, response(), { now: 10 }));
	const first = cache.readCachedResponse(request, selected, snapshot, { now: 20 });
	assert.equal(first.ageMs, 10);
	first.value.hits[0].row.id = 'mutated';
	const second = cache.readCachedResponse(request, selected, snapshot, { now: 30 });
	assert.equal(second.value.hits[0].row.id, 'original');
});

test('refuses comment-bearing responses', () => {
	cache.clearResponseCache();
	const request = options({ includeComments: true });
	assert.equal(cache.rememberResponse(request, shard(), storage(), response()), false);
	assert.equal(cache.readCachedResponse(request, shard(), storage()), null);
	assert.equal(cache.responseCacheSize(), 0);
});

test('invalidates when storage or request semantics change', () => {
	cache.clearResponseCache();
	const request = options();
	const selected = shard();
	cache.rememberResponse(request, selected, storage(), response());
	assert.equal(cache.readCachedResponse(request, selected, storage(101)), null);
	assert.equal(cache.readCachedResponse(options({ limit: 3 }), selected, storage()), null);
	assert.notEqual(
		cache.cacheKey(request, selected, storage()),
		cache.cacheKey(options({ query: 'Moshiach' }), selected, storage())
	);
});

test('expires by TTL and evicts the least recently used entry', () => {
	cache.clearResponseCache();
	const selected = shard();
	cache.rememberResponse(options({ query: 'one' }), selected, storage(), response('one'), {
		entryLimit: 2,
		now: 0
	});
	cache.rememberResponse(options({ query: 'two' }), selected, storage(), response('two'), {
		entryLimit: 2,
		now: 1
	});
	assert(cache.readCachedResponse(options({ query: 'one' }), selected, storage(), { now: 2 }));
	cache.rememberResponse(options({ query: 'three' }), selected, storage(), response('three'), {
		entryLimit: 2,
		now: 3
	});
	assert.equal(cache.readCachedResponse(options({ query: 'two' }), selected, storage()), null);
	assert.equal(cache.readCachedResponse(options({ query: 'one' }), selected, storage(), {
		now: 5001,
		ttlMs: 1000
	}), null);
});