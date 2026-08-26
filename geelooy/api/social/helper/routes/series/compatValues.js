// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityValues
 * @description
 * The Awtsmoos gathers legacy request shapes into one measured vessel of truth;
 * Awtsmoos.com lets compatibility routes stay readable while old clients retain their youth.
 */

const {
	requestBody
} = require('../requestValues.js');

/** Returns the method-aware compatibility request body. */
function compatibilityBody($i) {
	return requestBody($i);
}

/** Reveals the alias carried by body or query-era clients. */
function compatibilityAlias($i) {
	const body = compatibilityBody($i);
	return body.aliasId
		|| $i.$_GET?.aliasId
		|| $i.$_QUERY?.aliasId
		|| null;
}

/** Normalizes historical CSV-or-array ID payloads. */
function compatibilityIds(value) {
	if (Array.isArray(value)) {
		return value.filter(Boolean);
	}
	return String(value || '')
		.split(',')
		.map(id => id.trim())
		.filter(Boolean);
}

/** Resolves the historical parent-series aliases to one canonical value. */
function compatibilityParent($i) {
	const body = compatibilityBody($i);
	return body.parentSeriesId
		|| body.seriesId
		|| $i.$_GET?.parentSeriesId
		|| 'root';
}

/** Distinguishes legacy post payloads from legacy sub-series payloads. */
function isPostLike($i) {
	const input = compatibilityBody($i);
	return Boolean(
		input.postId
		|| input.title
		|| input.content
		|| input.dayuh
		|| input.type === 'post'
	);
}

module.exports = {
	compatibilityAlias,
	compatibilityBody,
	compatibilityIds,
	compatibilityParent,
	isPostLike
};
