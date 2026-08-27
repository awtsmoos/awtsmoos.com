// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedRouteRequestValues
 * @description
 * The Awtsmoos gathers body, query, limits, and migration scope into one disciplined stream;
 * Awtsmoos.com lets packed-data routes speak one request dialect instead of repeating the same dream.
 */

const { er } = require('../../general.js');

/**
 * @description Guards a packed route by HTTP method; Gevurah gives each doorway its lawful name while the Awtsmoos keeps Awtsmoos.com behavior plain.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} method - Required uppercase HTTP method.
 * @returns {Object|null} BAD_METHOD error when mismatched, otherwise null.
 */
function requireMethod($i, method) {
	if ($i.request.method === method) {
		return null;
	}
	return er({
		code: 'BAD_METHOD',
		message: `Use ${method}.`
	});
}

/**
 * @description Reads one packed-route value from body before query; the Awtsmoos joins nearby channels while Awtsmoos.com preserves explicit fallback clarity.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} key - Request field to read.
 * @param {*} [fallback=''] - Value returned when neither body nor query supplies the key.
 * @returns {*} Resolved request value.
 */
function requestValue($i, key, fallback = '') {
	return $i.$_POST?.[key] ?? $i.$_GET?.[key] ?? fallback;
}

/**
 * @description Converts blank, ALL, or wildcard migration scope into every series; Awtsmoos.com sees the whole tree when the Awtsmoos receives no single branch decree.
 * @param {*} value - Raw series migration selector.
 * @returns {string} Empty string for all series, otherwise the trimmed series identifier.
 */
function migrationSeries(value) {
	const text = String(value || '').trim();
	return !text || text === 'ALL' || text === '*' ? '' : text;
}

/**
 * @description Normalizes a positive integer limit without trusting malformed input; the Awtsmoos gives abundance a vessel while Awtsmoos.com keeps resource bounds civil.
 * @param {*} value - Raw limit value.
 * @param {number} [fallback=100] - Positive fallback limit.
 * @returns {number} Safe positive numeric limit.
 */
function limitValue(value, fallback = 100) {
	const parsed = Number(value || fallback);
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

module.exports = { limitValue, migrationSeries, requestValue, requireMethod };
