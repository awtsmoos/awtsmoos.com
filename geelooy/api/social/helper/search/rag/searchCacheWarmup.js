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
 * Runs one synthetic nearest-neighbor probe against an open vector session
 * so its hot graph pages and upper-layer nodes are cached before real
 * traffic arrives. Uses a deterministic unit vector; results are discarded.
 * Never throws: probe failure must not break session warmup.
 */
function probeVectorIndex(session, part = {}, lane = {}) {
	try {
		const database = session && session.database;
		const list = session && session.list;
		if (!database || !database.vector || !list) return false;
		const dimensions = Number(part.dimensions || lane.dimensions || 0);
		if (!Number.isFinite(dimensions) || dimensions <= 0) return false;
		const scale = 1 / Math.sqrt(dimensions);
		const probe = new Array(dimensions).fill(scale);
		database.vector.nearestIndexed(list, probe, 5);
		return true;
	} catch {
		return false;
	}
}

/**
 * Opens native vector sessions for every complete vector lane in the
 * background, without blocking the caller. Multipart HNSW corpora cost ~10s
 * to open cold (likkutei-sichos ships 28 parts); without this warmup the
 * first semantic queries after a restart always exceed the multi-lane public
 * deadline, so the two largest English vector lanes silently drop out of
 * every semantic answer. Failures only log; startup never waits for this.
 */
function warmVectorSessions($i, dependencies = {}) {
	const describeShards = dependencies.describedShards
		|| require('./shards.js').describedShards;
	const groupLanes = dependencies.groupedLanes
		|| require('./shards.js').grouped;
	const openSession = dependencies.openShardSession
		|| require('./shardStore.js').openShardSession;
	const beginSemantic = dependencies.beginSemanticWarmup
		|| require('./ragStartupWarmup.js').beginSemanticWarmup;
	const startedAt = Date.now();
	// The multilingual embedding worker (e5) also loads its model lazily;
	// start it now so likkutei-sichos vector queries don't hit a cold worker.
	try {
		beginSemantic();
	} catch (error) {
		console.error(`B"H semantic worker warmup start failed message=${error && error.message}`);
	}
	Promise.resolve()
		.then(() => describeShards($i))
		.then(shards => {
			let opened = 0;
			let probed = 0;
			const failures = [];
			for (const lane of groupLanes(shards || [])) {
				if (lane.vectorEnabled !== true) continue;
				const parts = lane.parts || [lane];
				for (const part of parts) {
					if (!part || !part.file) continue;
					try {
						const session = openSession(part);
						opened += 1;
						// One synthetic probe query per part pulls the hot HNSW
						// graph pages into the page cache and the upper-layer
						// nodes into the registry node cache, so the first real
						// semantic query doesn't pay the cold-walk cost.
						probeVectorIndex(session, part, lane);
						probed += 1;
					} catch (error) {
						failures.push({ lane: lane.id, message: error && error.message });
					}
				}
			}
			console.error(
				`B"H vector session warmup opened=${opened} probed=${probed} ` +
				`failures=${failures.length} elapsedMs=${Date.now() - startedAt}`
			);
			return { opened, probed, failures };
		})
		.catch(error => {
			console.error(`B"H vector session warmup failed message=${error && error.message}`);
			return { opened: 0, failed: true };
		});
	return { started: true };
}

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
	databaseDirectory,
	warmSearchCaches,
	warmVectorSessions
};
