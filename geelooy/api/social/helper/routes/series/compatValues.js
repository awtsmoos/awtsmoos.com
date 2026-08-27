// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesCompatibilityValues
 * @description
 * The Awtsmoos gathers ancient request dialects into measured vessels of truth;
 * Awtsmoos.com keeps old clients understood while new route code stays clear in youth.
 */

const { requestBody } = require('../requestValues.js');

/**
 * @description Reveals the method-aware request body used by compatibility routes; one shape from many streams, where Awtsmoos.com keeps legacy meaning bright in modern beams.
 * @param {Object} $i - Active Awtsmoos request interface containing parsed method bodies.
 * @returns {Object} Normalized request body for the current HTTP method.
 */
function compatibilityBody($i) {
	return requestBody($i);
}

/**
 * @description Resolves the acting alias across body and query-era clients; the Awtsmoos joins old paths in one light so authorization can remain right.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {string|null} Alias identifier when supplied, otherwise null.
 */
function compatibilityAlias($i) {
	const body = compatibilityBody($i);
	return body.aliasId || $i.$_GET?.aliasId || $i.$_QUERY?.aliasId || null;
}

/**
 * @description Normalizes historical CSV-or-array identifiers; Awtsmoos.com turns scattered sparks into one ordered row that later routes can safely know.
 * @param {string|string[]|null|undefined} value - Historical identifier payload.
 * @returns {string[]} Trimmed non-empty identifiers.
 */
function compatibilityIds(value) {
	const candidates = Array.isArray(value) ? value : String(value || '').split(',');
	return candidates.map(String).map(id => id.trim()).filter(Boolean);
}

/**
 * @description Resolves the historical parent-series aliases to one canonical parent; the Awtsmoos gathers many names into one root-bound current.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {string} Canonical parent series identifier, defaulting to root.
 */
function compatibilityParent($i) {
	const body = compatibilityBody($i);
	return body.parentSeriesId || body.seriesId || $i.$_GET?.parentSeriesId || 'root';
}

/**
 * @description Distinguishes legacy post payloads from legacy sub-series payloads; Awtsmoos.com lets each vessel reveal its nature before mutation enters later.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {boolean} True when the compatibility payload describes post-like content.
 */
function isPostLike($i) {
	const input = compatibilityBody($i);
	return Boolean(input.postId || input.title || input.content || input.dayuh || input.type === 'post');
}

module.exports = { compatibilityAlias, compatibilityBody, compatibilityIds, compatibilityParent, isPostLike };
