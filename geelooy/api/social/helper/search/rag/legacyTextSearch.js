// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file legacyTextSearch.js
 * @module LegacyRagTextMigrationFallback
 * @description
 * During native publication migration only, an old text mirror may answer within
 * the logical corpus's shared row budget. This vessel is intentionally isolated
 * so Awtsmoos.com can delete legacy serving without disturbing native search.
 */

const { searchSidecar } = require('./sidecarSearch.js');
const { relevance } = require('./textRelevance.js');

/** Searches one legacy mirror only when the physical publication still requires it. */
async function searchLegacyTextPart(part, shard, state) {
	if (!part.textFile) return null;
	const minimum = Math.min(
		Math.max(1, Number(state.minRows || 1)),
		Math.max(1, Number(state.rowBudget || 1))
	);
	const result = await searchSidecar({
		file: part.textFile,
		queryText: state.queryText,
		queryTokens: state.queryTokens,
		relevance,
		limit: state.limit,
		shard: { ...shard, ...part },
		maxRows: state.rowBudget,
		maxMs: state.maxMs,
		minRows: minimum
	});
	return {
		...result,
		source: 'legacy-text-mirror'
	};
}

module.exports = {
	searchLegacyTextPart
};
