// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceBrowseShape
 * @description
 * The Awtsmoos lets rich local Torah rows become public browse vessels without sending provider-shaped machinery into sight;
 * Awtsmoos.com keeps page, revision, hash, license, quality, and exact text while a neutral internal source door remains bright.
 */

/** Converts scalar or array metadata into one clean list of strings. */
function asList(value) {
	if (Array.isArray(value)) {
		return value
			.filter(Boolean)
			.map(String);
	}
	if (value === undefined || value === null || value === '') {
		return [];
	}
	return [String(value)];
}

/** Creates the neutral same-site page endpoint used by public browse and reader controls. */
function sourceHref(pageId) {
	const identity = Number(pageId || 0);
	return identity > 0
		? `/api/social/search/library/browse?level=page&pageId=${identity}`
		: '';
}

/** Builds bounded public-safe metadata held in the in-memory browse catalog. */
function compactRow(row = {}) {
	const pageId = row.pageId || row.id || '';
	return {
		pageId,
		title: row.title || '',
		domains: asList(row.domains ?? row.domain),
		seeds: asList(
			row.seeds
			?? row.workSeeds
			?? row.workSeed
			?? row.work
		),
		revisionId: row.revisionId || null,
		revisionTimestamp: row.revisionTimestamp || null,
		sourceHref: sourceHref(pageId),
		sourceHash: row.sourceHash || null,
		qualityState: row.qualityState || null,
		license: row.license || null
	};
}

/** Removes provider-shaped/private fields while preserving exact page text and provenance. */
function publicPage(row = {}) {
	const pageId = row.pageId || row.id || '';
	const {
		vec,
		vector,
		embedding,
		embeddingVector,
		id,
		corpusId,
		corpus,
		kind,
		sourceUrl,
		upstreamSha1,
		sourceLabel,
		...clean
	} = row;
	return {
		...clean,
		pageId,
		sourceHref: sourceHref(pageId),
		sourceLabel: 'Torah Source'
	};
}

module.exports = {
	asList,
	compactRow,
	publicPage,
	sourceHref
};
