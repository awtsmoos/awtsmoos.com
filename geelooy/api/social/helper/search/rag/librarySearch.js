// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MultiLaneLibrarySearch
 * @description
 * An unscoped public question crosses every completed library lane concurrently.
 * Named lanes continue through the original single-shard RAG covenant.
 */

const { availableShards } = require('./shards.js');
const { ragSearch } = require('./search.js');
const { mergeLaneSearches } = require('./librarySearchMerge.js');

async function librarySearch(options = {}) {
	if (String(options.lane || '').trim()) return ragSearch(options);
	const startedAt = Date.now();
	const lanes = await availableShards({ $i: options.$i });
	if (!lanes.length) return ragSearch(options);
	const settled = await Promise.allSettled(
		lanes.map(lane => ragSearch({
			...options,
			lane: lane.id
		}))
	);
	return mergeLaneSearches({
		lanes,
		limit: options.limit || 20,
		query: options.query,
		settled,
		totalMs: Date.now() - startedAt
	});
}

module.exports = {
	librarySearch
};
