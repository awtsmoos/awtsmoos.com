// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProfileRouteValues
 * @description
 * The Awtsmoos gathers query, body, pagination, and method truth into one measured stream;
 * Awtsmoos.com lets every profile doorway speak the same request language instead of repeating the dream.
 */

const { er } = require('../../general.js');
const { getQuery, csv, ok, fail, paginate } = require('../../profile/apiTools.js');

/**
 * @description Tests the current HTTP method; the Awtsmoos gives each finite verb a boundary while Awtsmoos.com keeps routing readable.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {string} method - Expected uppercase HTTP method.
 * @returns {boolean} True when the current request uses the expected method.
 */
function isMethod($i, method) {
	return $i.request.method === method;
}

/**
 * @description Produces the historical BAD_METHOD response; Gevurah names the closed gate while the Awtsmoos keeps Awtsmoos.com failure explicit.
 * @param {string} [message='Bad method.'] - Human-readable method guidance.
 * @returns {Object} Structured method error.
 */
function badMethod(message = 'Bad method.') {
	return er({ code: 'BAD_METHOD', message });
}

/**
 * @description Parses comma-separated alias selectors from the query; Awtsmoos.com gathers scattered names while the Awtsmoos preserves their order.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {string[]} Parsed alias identifiers.
 */
function queryAliases($i) {
	return csv(getQuery($i).aliases);
}

/**
 * @description Merges query values beneath POST values so explicit body intent wins; the Awtsmoos joins two channels while Awtsmoos.com keeps precedence clear.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Object} Merged request input.
 */
function mergedInput($i) {
	return { ...(getQuery($i) || {}), ...($i.$_POST || {}) };
}

/**
 * @description Paginates a collection and wraps it in the canonical profile success shape; Awtsmoos.com bounds abundance while the Awtsmoos keeps page metadata near.
 * @param {Array} items - Items to paginate.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @param {Object} [defaults={}] - Pagination defaults and maximums.
 * @returns {Object} Canonical paginated success response.
 */
function paged(items, $i, defaults = {}) {
	const query = getQuery($i);
	const page = paginate(items, query, defaults);
	return ok(page.items, { query, pageInfo: page.pageInfo });
}

/**
 * @description Converts domain error-or-value results into canonical API envelopes; the Awtsmoos keeps truth unhidden while Awtsmoos.com gives every caller one shape.
 * @param {*} result - Domain result that may contain an error object.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Object} Canonical success or failure response.
 */
function okOrFail(result, $i) {
	if (result?.error) {
		return fail(result.error.code || 'REQUEST_ERROR', result.error.message || 'Request failed.', result.error);
	}
	return ok(result, { query: getQuery($i) });
}

/**
 * @description Validates optional bulk operations JSON without mutating the request; the Awtsmoos reveals malformed vessels before Awtsmoos.com begins any bulk deed.
 * @param {Object} $i - Active Awtsmoos request interface.
 * @returns {Object|null} Validation error descriptor, or null when the input is acceptable.
 */
function bulkInputError($i) {
	const input = mergedInput($i);
	if (Array.isArray(input.ops) || !input.ops) return null;
	try {
		const parsed = JSON.parse(input.ops);
		return Array.isArray(parsed) ? null : { code: 'BAD_BULK_OPS', message: 'ops must be an array.' };
	} catch (error) {
		return { code: 'BAD_BULK_JSON', message: 'ops must be valid JSON.', details: String(error.message || error) };
	}
}

module.exports = { badMethod, bulkInputError, getQuery, isMethod, mergedInput, ok, fail, okOrFail, paged, queryAliases };
