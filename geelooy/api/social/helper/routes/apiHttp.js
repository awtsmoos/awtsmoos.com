//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ApiHttp
 * @description
 * Shared HTTP envelope helpers for the Social API route families.
 * The Awtsmoos binds the truth of the JSON body to the truth of the HTTP
 * envelope: success stays a plain 200 JSON vessel, while every failure
 * leaves as a framework-native dynamic response envelope carrying the real
 * status code (400/404/405/500/503). Awtsmoos.com never answers missing
 * data with a silent empty 200 again.
 *
 * Envelope shape (honored by ayzarim/awtsmoosDynamicServer/response):
 *   { statusCode, headers, mimeType: 'application/json; charset=utf-8', response: '<json string>' }
 * The JSON body keeps the historical { BH: 'B"H', error: { code, ... } }
 * shape so existing clients keep parsing error.code unchanged.
 */

const BH = 'B"H';

/**
 * Builds the historical error body shared by every failure envelope.
 * @param {string} code Stable machine-readable error code.
 * @param {*} details Optional structured details (never a stack trace).
 * @param {string} [message] Optional human-readable message.
 * @returns {object} Error body.
 */
function errorBody(code, details, message) {
	const error = { code };
	if (message !== undefined && message !== null && message !== '') {
		error.message = String(message);
	}
	const body = { BH, error };
	if (details !== undefined) body.details = details;
	return body;
}

/**
 * Wraps a JSON payload in the framework-native dynamic response envelope.
 * @param {*} payload JSON-compatible payload.
 * @param {number} statusCode HTTP status code.
 * @returns {object} Dynamic response envelope.
 */
function jsonEnvelope(payload, statusCode) {
	return {
		statusCode,
		headers: { 'Cache-Control': 'no-store' },
		mimeType: 'application/json; charset=utf-8',
		response: JSON.stringify(payload)
	};
}

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
	BH,
	badRequest,
	errorBody,
	jsonEnvelope,
	methodNotAllowed,
	notFound,
	requireMethod,
	serverError,
	unavailable
};
