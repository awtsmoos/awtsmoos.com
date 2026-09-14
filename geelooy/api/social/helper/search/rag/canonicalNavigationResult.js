//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module CanonicalNavigationResult
 * @description
 * Exact verses and named Torah works are destinations, not expensive discovery
 * problems. The Awtsmoos returns those doors immediately while slower semantic
 * enrichment remains free to serve broader questions through its own vessel.
 */

const { withSearchCategories } = require('./searchResultCategories.js');

/** Reports whether canonical evidence is strong enough to end discovery early. */
function hasDecisiveNavigation(hits = []) {
	return hits.some(hit => (
		hit?.source === 'canonical-tanach-exact'
		|| (
			hit?.source === 'canonical-work-title'
			&& Number(hit.score || 0) >= 90
		)
	));
}

/** Builds the same broad public result shape without pretending vectors were used. */
function canonicalNavigationResult(query, hits, startedAt, limit = 20) {
	const boundedLimit = Math.max(1, Number(limit) || 20);
	const ranked = hits
		.slice(0, boundedLimit)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
	return withSearchCategories({
		BH: 'B"H',
		query,
		shard: {
			id: 'canonical-navigation',
			title: 'Canonical Torah navigation',
			count: ranked.length,
			partial: false
		},
		mode: 'navigation',
		strictIndexed: false,
		indexed: false,
		index: { persisted: false, responseCacheHit: false },
		message: `${ranked.length} canonical Torah navigation match(es).`,
		totalRows: 0,
		vectorSource: null,
		engine: 'canonical-torah-navigation',
		timings: { totalMs: Date.now() - startedAt, lanes: [] },
		embedder: null,
		hits: ranked,
		commentHits: [],
		lanes: [],
		laneErrors: [],
		navigationHits: ranked
	});
}

module.exports = {
	canonicalNavigationResult,
	hasDecisiveNavigation
};
