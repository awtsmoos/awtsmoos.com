//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file searchCacheWarmup.test.js
 * @description The Awtsmoos warms publication truth through an isolated worker;
 * Awtsmoos.com shapes success, stale testimony, timeout, and missing-root failure
 * without ever reopening native search databases on the HTTP event loop.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	databaseDirectory,
	warmSearchCaches
} = require('../searchCacheWarmup.js');

const workerResult = {
	fingerprint: '1:2:3:4',
	generation: 'generation-1',
	items: [{ id: 'meluket', aliases: ['meluket'], count: 1 }]
};

test('databaseDirectory resolves only the configured database root', () => {
	assert.equal(databaseDirectory({ db: { directory: '/tmp/search-root' } }), '/tmp/search-root');
	assert.equal(databaseDirectory({}), '');
});

test('worker success primes matching catalog testimony', async () => {
	const calls = [];
	const result = await warmSearchCaches({ db: { directory: '/tmp/search-root' } }, {
		timeoutMs: 77,
		async runCatalogWarmWorker(directory, options) {
			calls.push(['worker', directory, options.timeoutMs]);
			return { ok: true, elapsedMs: 12, result: workerResult };
		},
		primeCatalogCache(searchInterface, payload) {
			calls.push(['prime', searchInterface.db.directory, payload.generation]);
			return { ok: true, stale: false, count: 1 };
		},
		catalogCacheStatus: () => ({ count: 1, maximum: 4 })
	});
	assert.equal(result.ok, true);
	assert.equal(result.worker, 'thread');
	assert.equal(result.publicationCount, 1);
	assert.equal(result.sessionWarmup, 'deferred-native-open');
	assert.deepEqual(calls, [
		['worker', '/tmp/search-root', 77],
		['prime', '/tmp/search-root', 'generation-1']
	]);
});

test('worker timeout remains explicit compact failure', async () => {
	const result = await warmSearchCaches({ db: { directory: '/tmp/search-root' } }, {
		async runCatalogWarmWorker() {
			return {
				ok: false,
				timeout: true,
				elapsedMs: 50,
				error: { code: 'SEARCH_CATALOG_WARM_TIMEOUT', message: 'timed out' }
			};
		}
	});
	assert.equal(result.ok, false);
	assert.equal(result.timeout, true);
	assert.equal(result.code, 'SEARCH_CATALOG_WARM_TIMEOUT');
});

test('stale worker result is refused after publication replacement', async () => {
	const result = await warmSearchCaches({ db: { directory: '/tmp/search-root' } }, {
		async runCatalogWarmWorker() {
			return { ok: true, elapsedMs: 9, result: workerResult };
		},
		primeCatalogCache() {
			return { ok: false, stale: true };
		}
	});
	assert.equal(result.ok, false);
	assert.equal(result.stale, true);
	assert.equal(result.code, 'SEARCH_CATALOG_WARM_STALE');
});

test('missing root fails without spawning worker', async () => {
	let calls = 0;
	const result = await warmSearchCaches({}, {
		runCatalogWarmWorker() {
			calls += 1;
		}
	});
	assert.equal(result.ok, false);
	assert.equal(result.code, 'SEARCH_WARM_ROOT_MISSING');
	assert.equal(calls, 0);
});
