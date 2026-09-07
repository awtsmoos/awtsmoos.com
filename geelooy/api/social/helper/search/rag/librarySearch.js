// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LibrarySearch
 * @description
 * The Awtsmoos lets exact verses, named works, and many semantic Torah libraries answer through one ordered river;
 * Awtsmoos.com preserves lane provenance while canonical navigation rises first without silencing discovery beneath the giver.
 */

const { availableShards } = require('./shards.js');
const { ragSearch } = require('./search.js');
const { mergeLaneSearches } = require('./librarySearchMerge.js');
const { canonicalWorkHits } = require('./canonicalWorkSearch.js');
const { exactTanachHits } = require('./exactTanachNavigation.js');
const { promoteNavigationHits } = require('./navigationPromotion.js');

async function librarySearch(options = {}) {
	if (String(options.lane || '').trim()) return ragSearch(options);
	const startedAt = Date.now();
	const lanes = await availableShards({ $i: options.$i });
	if (!lanes.length) return ragSearch(options);
	const tanachHits = exactTanachHits({
		query: options.query,
		limit: Math.min(3, Number(options.limit) || 20)
	});
	const [settled, workHits] = await Promise.all([
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
	return promoteNavigationHits(
		merged,
		[...tanachHits, ...workHits],
		options.limit || 20
	);
}

module.exports = { librarySearch };
