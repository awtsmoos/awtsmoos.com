//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file searchCacheWarmup.js
 * @description
 * The Awtsmoos lets cold catalog decoding happen outside the HTTP event loop;
 * Awtsmoos.com accepts only worker testimony whose publication fingerprint still
 * matches the live immutable vessel when the main process receives it.
 */

const {
	catalogCacheStatus,
	primeCatalogCache
} = require('./shardCatalog.js');
const {
	DEFAULT_CATALOG_WARM_TIMEOUT_MS,
	runCatalogWarmWorker
} = require('./searchCatalogWorkerClient.js');

/** Returns one stable database root without guessing alternate storage. */
function databaseDirectory($i) {
	return String($i?.db?.directory || '');
}

/**
 * Warms the publication catalog through a physically isolated worker thread.
 * Native search database sessions remain deferred to request-time reuse.
 */
async function warmSearchCaches($i, dependencies = {}) {
	const directory = databaseDirectory($i);
	if (!directory) {
		return {
			ok: false,
			code: 'SEARCH_WARM_ROOT_MISSING',
			message: 'Search cache warmup has no database root.'
		};
	}
	const runWorker = dependencies.runCatalogWarmWorker || runCatalogWarmWorker;
	const prime = dependencies.primeCatalogCache || primeCatalogCache;
	const cacheStatus = dependencies.catalogCacheStatus || catalogCacheStatus;
	const timeoutMs = dependencies.timeoutMs || DEFAULT_CATALOG_WARM_TIMEOUT_MS;
	const worker = await runWorker(directory, { timeoutMs });
	if (!worker.ok) {
		return {
			ok: false,
			timeout: worker.timeout === true,
			elapsedMs: worker.elapsedMs,
			code: worker.error?.code || 'SEARCH_CATALOG_WARM_FAILED',
			message: worker.error?.message || 'Search catalog warm worker failed.'
		};
	}
	const primed = prime($i, worker.result, dependencies.catalogDependencies || {});
	if (!primed.ok) {
		return {
			ok: false,
			stale: true,
			elapsedMs: worker.elapsedMs,
			code: 'SEARCH_CATALOG_WARM_STALE',
			message: 'Publication changed while the warm worker was decoding it.'
		};
	}
	return {
		ok: true,
		worker: 'thread',
		elapsedMs: worker.elapsedMs,
		generation: String(worker.result?.generation || ''),
		publicationCount: primed.count,
		catalog: cacheStatus(),
		sessionWarmup: 'deferred-native-open'
	};
}

module.exports = {
	databaseDirectory,
	warmSearchCaches
};
