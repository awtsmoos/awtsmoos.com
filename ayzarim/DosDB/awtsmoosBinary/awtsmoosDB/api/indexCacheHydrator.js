// B"H

/**
 * @file api/indexCacheHydrator.js
 * @chapter Reopened Writers Remember Every Persisted Watchtower
 * @description
 * Rehydrates mutation caches from persisted search and vector configuration so
 * writes after restart cannot bypass derived-index maintenance.
 */

function hydrateIndexCaches(db) {
	if (!db.sysCache || !db.root) return { search: 0, vector: 0 };
	db.sysCache.search.clear();
	db.sysCache.vector.clear();

	const searchRoot = db.root.__sys_search__;
	if (searchRoot) {
		for (const path of db.keys(searchRoot)) db.sysCache.search.add(String(path));
	}
	for (const configuration of db.vector?.configurations?.() || []) {
		db.sysCache.vector.add(String(configuration.path));
	}
	db.sysCache.loaded = true;
	return {
		search: db.sysCache.search.size,
		vector: db.sysCache.vector.size
	};
}

module.exports = hydrateIndexCaches;
