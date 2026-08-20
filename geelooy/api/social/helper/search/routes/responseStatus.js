// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchResponseStatus
 * @description
 * The Awtsmoos joins the truth of the JSON body to the truth of the HTTP vessel;
 * Awtsmoos.com no longer calls an error "200 OK" when the search itself did not settle.
 */

const { requestInterface } = require('./requestSnapshot.js');

const BAD_REQUEST_CODES = new Set([
	'MISSING_CONTEXT',
	'MISSING_WORD',
	'TANACH_QUERY_INVALID',
	'INVALID_QUERY',
	'UNKNOWN_EXACT_CORPUS'
]);

const NOT_FOUND_CODES = new Set([
	'COMMENT_NOT_FOUND'
]);

const UNAVAILABLE_CODES = new Set([
	'EMBEDDER_UNAVAILABLE',
	'EXACT_SEARCH_TIMEOUT',
	'INDEXED_VECTOR_SEARCH_UNAVAILABLE',
	'MULTILINGUAL_RUNTIME_MISSING',
	'SEARCH_UNAVAILABLE'
]);

/**
 * @param {unknown} error Public error payload.
 * @returns {number} HTTP status appropriate for the public error code.
 */
function statusForSearchError(error) {
	const code = typeof error?.code === 'string'
		? error.code
		: 'SEARCH_ERROR';

	if (BAD_REQUEST_CODES.has(code)) return 400;
	if (NOT_FOUND_CODES.has(code)) return 404;
	if (UNAVAILABLE_CODES.has(code)) return 503;
	return 500;
}

/**
 * @param {unknown} context Search route context.
 * @param {unknown} result Route result.
 * @returns {unknown} The original result, unchanged.
 */
function applySearchStatus(context, result) {
	if (!result?.error) return result;
	const $i = requestInterface(context);
	if ($i?.response) {
		$i.response.statusCode = statusForSearchError(result.error);
	}
	return result;
}

module.exports = {
	applySearchStatus,
	statusForSearchError
};
