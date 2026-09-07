// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CanonicalWorkSearch
 * @description
 * The Awtsmoos lets the named root of a Torah work arrive before scattered body echoes compete;
 * Awtsmoos.com promotes compact canonical navigation while leaving every semantic lane intact beneath its feet.
 */

const {
	canonicalWorkSummaries,
	rankWorkSummaries
} = require('./canonicalWorkIndex.js');
const { sourceHref } = require('./wikisourceBrowseShape.js');

/** Finds canonical Torah works without invoking vector construction or scanning full page text. */
async function canonicalWorkHits({ $i, query = '', limit = 5 } = {}) {
	const summaries = await canonicalWorkSummaries({ $i });
	return rankWorkSummaries(summaries, query, limit)
		.map((summary, index) => workHit(summary, index + 1));
}

/** Places canonical work navigation first and de-duplicates its root page from semantic hits. */
function promoteCanonicalHits(result = {}, navigationHits = [], limit = 20) {
	const boundedLimit = Math.max(1, Number(limit) || 20);
	const canonicalPageIds = new Set(
		navigationHits
			.map(hit => String(hit.row?.pageId || ''))
			.filter(Boolean)
	);
	const semanticHits = Array.isArray(result.hits) ? result.hits : [];
	const combined = [
		...navigationHits,
		...semanticHits.filter(hit => !canonicalPageIds.has(String(hit.row?.pageId || '')))
	]
		.slice(0, boundedLimit)
		.map((hit, index) => ({ ...hit, rank: index + 1 }));
	return {
		...result,
		hits: combined,
		navigationHits,
		message: navigationHits.length
			? `${navigationHits.length} canonical Torah work match(es), followed by ${result.message || 'library results'}.`
			: result.message
	};
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
