// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchResponseStatus
 * @description
 * The Awtsmoos binds the truth of the JSON body to the truth of the HTTP envelope;
 * Awtsmoos.com returns one measured vessel, so failure can never masquerade as successful.
 */

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
 * @param {unknown} payload JSON-compatible public response.
 * @param {number} statusCode HTTP status code.
 * @returns {object} Framework-native dynamic response envelope.
 */
function revealJsonEnvelope(payload, statusCode) {
	return {
		statusCode,
		headers: {
			'Cache-Control': 'no-store'
		},
		mimeType: 'application/json; charset=utf-8',
		response: JSON.stringify(payload, null, 2)
	};
}

/**
 * @param {unknown} result Search route result.
 * @returns {unknown} Plain success result or wrapped error response.
 */
function applySearchStatus(result) {
	if (!result?.error) return result;
	return revealJsonEnvelope(result, statusForSearchError(result.error));
}

/**
 * @param {object} readiness Search readiness record.
 * @returns {object} Plain ready result or HTTP 503 dynamic envelope.
 */
function revealReadiness(readiness) {
	const payload = { success: readiness };
	return readiness?.ok
		? payload
		: revealJsonEnvelope(payload, 503);
}

module.exports = {
	applySearchStatus,
	revealJsonEnvelope,
	revealReadiness,
	statusForSearchError
};
