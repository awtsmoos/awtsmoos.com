// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicTorahSourceIdentity
 * @description
 * The Awtsmoos lets an internal publication keep its exact machine name while the learner receives only Torah-facing light;
 * Awtsmoos.com maps one neutral public lane back to the reviewed local corpus, so routing stays exact and provider branding stays out of sight.
 */

const INTERNAL_TORAH_SOURCE_LANE = 'hewikisource-torah';
const PUBLIC_TORAH_SOURCE_LANE = 'torah-source-corpus';
const PROVIDER_WORD = /wiki(?:media|source)/i;

/** Returns true only for the reviewed local Torah-source publication lane or rows emitted from it. */
function isTorahSource(value = {}) {
	return value.id === INTERNAL_TORAH_SOURCE_LANE
		|| value.corpusId === INTERNAL_TORAH_SOURCE_LANE
		|| value.corpus === INTERNAL_TORAH_SOURCE_LANE
		|| value.kind === 'wikisource-page';
}

/** Maps the neutral public lane back to the exact internal resolver identity. */
function internalLaneForRequest(value = '') {
	const requested = String(value || '').trim().toLowerCase();
	return requested === PUBLIC_TORAH_SOURCE_LANE
		? INTERNAL_TORAH_SOURCE_LANE
		: requested;
}

/** Returns a neutral public lane identity while leaving unrelated lanes untouched. */
function publicLaneId(shard = {}) {
	return isTorahSource(shard)
		? PUBLIC_TORAH_SOURCE_LANE
		: String(shard.id || '');
}

/** Returns a neutral corpus title while preserving every unrelated corpus title. */
function publicCorpusTitle(shard = {}, fallback = '') {
	return isTorahSource(shard)
		? 'Torah Source Corpus'
		: fallback;
}

/** Removes all provider-family aliases and supplies stable Torah-facing aliases. */
function publicCorpusAliases(shard = {}) {
	if (isTorahSource(shard)) {
		return [
			'torah-source',
			'torah sources',
			'torah corpus'
		];
	}
	const aliases = Array.isArray(shard.aliases)
		? shard.aliases.map(String)
		: [];
	return aliases.filter(alias => !PROVIDER_WORD.test(alias));
}

/** Returns a neutral provenance label for downloaded Torah-source rows. */
function publicSourceLabel(row = {}, fallback = '') {
	return isTorahSource(row)
		? 'Torah Source'
		: fallback;
}

/** Creates an internal neutral page endpoint from stable source identity. */
function publicSourceHref(row = {}) {
	if (!isTorahSource(row)) return '';
	const pageId = Number(row.pageId || 0);
	return pageId > 0
		? `/api/social/search/library/browse?level=page&pageId=${pageId}`
		: '';
}

module.exports = {
	INTERNAL_TORAH_SOURCE_LANE,
	PROVIDER_WORD,
	PUBLIC_TORAH_SOURCE_LANE,
	internalLaneForRequest,
	isTorahSource,
	publicCorpusAliases,
	publicCorpusTitle,
	publicLaneId,
	publicSourceHref,
	publicSourceLabel
};
