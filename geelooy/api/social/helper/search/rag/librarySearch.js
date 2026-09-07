// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearch
 * @description
 * The Awtsmoos lets many published Torah libraries answer one query while a named sefer keeps its root before body echoes;
 * Awtsmoos.com preserves lane provenance and vector isolation, adding only compact canonical navigation to the search-time river.
 */

const { availableShards } = require('./shards.js');
const { ragSearch } = require('./search.js');
const { mergeLaneSearches } = require('./librarySearchMerge.js');
const {
	canonicalWorkHits,
	promoteCanonicalHits
} = require('./canonicalWorkSearch.js');

async function librarySearch(options = {}) {
	if (String(options.lane || '').trim()) {
		return ragSearch(options);
	}
	const startedAt = Date.now();
	const lanes = await availableShards({ $i: options.$i });
	if (!lanes.length) {
		return ragSearch(options);
	}
	const [settled, navigationHits] = await Promise.all([
		Promise.allSettled(lanes.map(lane => ragSearch({
			...options,
			lane: lane.id
		}))),
		canonicalWorkHits({
			$i: options.$i,
			query: options.query,
			limit: Math.min(5, Number(options.limit) || 20)
		}).catch(() => [])
	]);
	const merged = mergeLaneSearches({
		lanes,
		limit: options.limit || 20,
		query: options.query,
		settled,
		totalMs: Date.now() - startedAt
	});
	return promoteCanonicalHits(
		merged,
		navigationHits,
		options.limit || 20
	);
}

module.exports = {
	librarySearch
};
