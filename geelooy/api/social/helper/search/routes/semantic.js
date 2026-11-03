// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SemanticSearchRoutes
 * @description
 * The Awtsmoos lets semantic inquiry enter the same reviewed Torah library river instead of spawning a rival sea;
 * Awtsmoos.com forces vector ranking where vectors exist, while lane errors remain visible and text-only mirrors stay honestly free.
 * When every vector lane is down, the answer is lexical — and the response
 * must SAY so. A degraded answer carries `degraded: true`, the requested
 * strategy, and a plain-language reason, instead of dressing stopword-floor
 * lexical matches up as semantic results.
 */

const { librarySearch } = require('../rag/librarySearch.js');
const { libraryOptions } = require('./values.js');
const { safe } = require('./safe.js');

/** Builds the semantic contract on top of the existing multi-lane library engine. */
function semanticOptions(context) {
	return libraryOptions(context, {
		autoInstall: false,
		strategy: 'vector',
		requireIndexed: false
	});
}

/**
 * Marks a vector-requested answer that only lexical lanes could serve. The
 * mode field already reports 'text'; this adds the explicit degradation
 * testimony (requested strategy, failing lanes, plain-language message) so
 * no caller can mistake the fallback for semantic ranking.
 */
function annotateSemanticResult(result) {
	if (!result || typeof result !== 'object') return result;
	if (result.mode !== 'text') return result;
	const laneErrors = Array.isArray(result.laneErrors) ? result.laneErrors : [];
	const failing = laneErrors.map(entry => entry.id).filter(Boolean);
	return {
		...result,
		requestedStrategy: 'vector',
		degraded: true,
		degradation: {
			reason: 'vector-lanes-unavailable',
			message: failing.length
				? `Semantic ranking is unavailable (lanes failing: ${failing.join(', ')}); these are lexical text matches, ranked by word evidence only.`
				: 'Semantic ranking is unavailable; these are lexical text matches, ranked by word evidence only.',
			failingLanes: failing
		},
		message: result.hits?.length
			? `Semantic ranking unavailable — showing ${result.hits.length} lexical text match(es) instead. ${result.message || ''}`.trim()
			: 'Semantic ranking is unavailable and no source segment matched this lexical query.'
	};
}

function semanticRoutes(context) {
	return {
		'/search/semantic': async () => safe(async () => ({
			success: annotateSemanticResult(await librarySearch(semanticOptions(context)))
		}))
	};
}

module.exports = {
	annotateSemanticResult,
	semanticOptions,
	semanticRoutes
};
