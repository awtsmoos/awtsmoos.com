//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ApiHttpResponses
 * @description
 * Sibling of ApiHttp: status envelope helpers and the method guard, relocated verbatim.
 */

const { errorBody, jsonEnvelope } = require('./apiHttpCore.js');

/**
 * Maps a thrown failure to a 500 envelope without leaking internals.
 * @param {string} code Stable error code for this route family.
 * @param {*} caught The caught error.
 * @returns {object} 500 dynamic response envelope.
 */
function serverError(code, caught) {
	const message = caught && caught.message ? String(caught.message) : String(caught || 'unknown failure');
	// Never ship stack traces to readers; keep the message bounded.
	return jsonEnvelope(errorBody(code, undefined, message.slice(0, 300)), 500);
}

/**
 * 400 envelope for invalid caller input.
 * @param {string} code Stable error code (e.g. MISSING_KEY).
 * @param {*} details Structured details about what was wrong.
 * @param {string} [message] Human-readable message.
 * @returns {object} 400 dynamic response envelope.
 */
function badRequest(code, details, message) {
	return jsonEnvelope(errorBody(code, details, message), 400);
}

/**
 * 404 envelope for a missing record, series, alias, or post.
 * @param {string} code Stable error code (e.g. SERIES_NOT_FOUND).
 * @param {*} details Identity that was looked up (heichelId/seriesId/...).
 * @returns {object} 404 dynamic response envelope.
 */
function notFound(code, details) {
	return jsonEnvelope(errorBody(code, details), 404);
}

/**
 * 405 envelope for a wrong HTTP method on a route.
 * @param {string|string[]} allow Allowed method(s).
 * @returns {object} 405 dynamic response envelope.
 */
function methodNotAllowed(allow) {
	const allowed = Array.isArray(allow) ? allow : [allow];
	return jsonEnvelope(errorBody('METHOD_NOT_ALLOWED', { allow: allowed }), 405);
}

/**
 * 503 envelope for a dependency that is unavailable (index not built, etc.).
 * @param {string} code Stable error code.
 * @param {string} [message] Human-readable message.
 * @returns {object} 503 dynamic response envelope.
 */
function unavailable(code, message) {
	return jsonEnvelope(errorBody(code, undefined, message), 503);
}

/**
 * Guards a route handler with an HTTP method allow-list.
 * @param {object} $i Active request interface.
 * @param {string|string[]} allow Allowed method(s).
 * @returns {object|null} 405 envelope when the method is wrong, else null.
 */
function requireMethod($i, allow) {
	const allowed = Array.isArray(allow) ? allow : [allow];
	if (allowed.includes($i?.request?.method)) return null;
	return methodNotAllowed(allowed);
}

module.exports = {
	serverError,
	badRequest,
	notFound,
	methodNotAllowed,
	unavailable,
	requireMethod
};
