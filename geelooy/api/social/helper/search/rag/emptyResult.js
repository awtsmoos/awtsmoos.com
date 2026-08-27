// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmptyRagResult
 * @description
 * When a generic library search has no shard, this quiet vessel reports absence
 * honestly. Strict RAG never reaches it because strict shard resolution fails closed.
 */

function emptyLibrary(query, timings, totalStartedAt, now) {
	timings.totalMs = Number((now() - totalStartedAt).toFixed(3));
	return {
		BH: 'B"H',
		query,
		shard: null,
		mode: 'empty',
		strictIndexed: false,
		indexed: false,
		index: {
			persisted: false
		},
		message: 'No library is available on this server.',
		totalRows: 0,
		vectorSource: null,
		engine: 'none',
		timings,
		embedder: null,
		hits: [],
		commentHits: []
	};
}

module.exports = {
	emptyLibrary
};
