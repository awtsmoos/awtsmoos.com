// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CanonicalWorkSearch
 * @description
 * Registered Torah works resolve from a tiny identity registry before any corpus
 * catalog opens. Unknown or partial names may still enter compact catalog ranking,
 * preserving broad discovery without charging exact navigation the scan cost.
 */

const {
	canonicalWorkSummaries,
	rankWorkSummaries,
	workIdentityScore
} = require('./canonicalWorkIndex.js');
const { promoteNavigationHits } = require('./navigationPromotion.js');
const {
	registeredWorkIdentityForQuery
} = require('./sourceWorkIdentity.js');
const { sourceHref } = require('./wikisourceBrowseShape.js');

/** Converts a stable registry identity into the summary shape shared by ranking. */
function registeredSummary(query) {
	const identity = registeredWorkIdentityForQuery(query);
	if (!identity) return null;
	const summary = {
		domain: identity.domain,
		work: identity.work,
		title: identity.title,
		pageId: identity.pageId,
		count: 0
	};
	return {
		...summary,
		score: workIdentityScore(summary, query)
	};
}

async function canonicalWorkHits({ $i, query = '', limit = 5 } = {}) {
	const registered = registeredSummary(query);
	if (registered) return [workHit(registered, 1)];
	const summaries = await canonicalWorkSummaries({ $i });
	return rankWorkSummaries(summaries, query, limit)
		.map((summary, index) => workHit(summary, index + 1));
}

/** Preserves the historical work-specific promotion API for callers and tests. */
function promoteCanonicalHits(result = {}, navigationHits = [], limit = 20) {
	const promoted = promoteNavigationHits(result, navigationHits, limit);
	return navigationHits.length ? {
		...promoted,
		message: `${navigationHits.length} canonical Torah work match(es), followed by ${result.message || 'library results'}.`
	} : promoted;
}

function workHit(summary, rank) {
	const workHref = `/api/social/search/library/browse?${new URLSearchParams({
		level: 'work',
		domain: summary.domain,
		work: summary.work
	})}`;
	return {
		id: `torah-work:${summary.domain}:${summary.work}`,
		rank,
		score: summary.score,
		source: 'canonical-work-title',
		row: {
			type: 'torah-work',
			title: summary.title,
			work: summary.work,
			domain: summary.domain,
			pageId: summary.pageId,
			count: summary.count,
			sourceHref: sourceHref(summary.pageId),
			browseHref: workHref,
			sourceLabel: 'Torah Source',
			libraryLaneId: 'torah-source-corpus',
			libraryLaneTitle: 'Torah Source Corpus',
			canonicalNavigation: true
		}
	};
}

module.exports = {
	canonicalWorkHits,
	promoteCanonicalHits,
	registeredSummary,
	workHit
};
