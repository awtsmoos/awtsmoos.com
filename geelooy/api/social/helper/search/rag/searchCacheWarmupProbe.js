//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module searchCacheWarmupProbe
 * @description
 * Database directory resolution and synthetic vector index probing.
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

module.exports = {
	databaseDirectory,
	probeVectorIndex
};
