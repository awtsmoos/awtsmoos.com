// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CanonicalWorkSearch
 * @description
 * The Awtsmoos lets the named root of a Torah work arrive before scattered body echoes compete;
 * Awtsmoos.com shapes stable work navigation and delegates de-duplication to the shared canonical promotion vessel.
 */

const {
	canonicalWorkSummaries,
	rankWorkSummaries
} = require('./canonicalWorkIndex.js');
const { promoteNavigationHits } = require('./navigationPromotion.js');
const { sourceHref } = require('./wikisourceBrowseShape.js');

async function canonicalWorkHits({ $i, query = '', limit = 5 } = {}) {
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
	workHit
};
