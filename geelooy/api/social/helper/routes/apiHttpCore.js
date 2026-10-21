//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ApiHttpCore
 * @description
 * Sibling of ApiHttp: BH constant, error body and JSON envelope, relocated verbatim.
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

module.exports = {
	BH,
	errorBody,
	jsonEnvelope
};
