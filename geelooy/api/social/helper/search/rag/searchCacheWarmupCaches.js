//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module searchCacheWarmupCaches
 * @description
 * Catalog cache warmup through the isolated worker, then vector session warmup.
 */

const {
	catalogCacheStatus,
	primeCatalogCache
} = require('./shardCatalog.js');
const {
	DEFAULT_CATALOG_WARM_TIMEOUT_MS,
	runCatalogWarmWorker
} = require('./searchCatalogWorkerClient.js');

const { databaseDirectory } = require('./searchCacheWarmupProbe.js');
const { warmVectorSessions } = require('./searchCacheWarmupSessions.js');

/**
 * Warms the publication catalog through a physically isolated worker thread,
 * then opens native vector sessions for semantic lanes in the background.
 * The vector open never blocks this function's resolution.
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
	const vectorWarm = dependencies.warmVectorSessions || warmVectorSessions;
	const vectorWarmup = vectorWarm($i, dependencies);
	return {
		ok: true,
		worker: 'thread',
		elapsedMs: worker.elapsedMs,
		generation: String(worker.result?.generation || ''),
		publicationCount: primed.count,
		catalog: cacheStatus(),
		sessionWarmup: 'background-vector-open',
		vectorWarmup
	};
}

module.exports = {
	warmSearchCaches
};
