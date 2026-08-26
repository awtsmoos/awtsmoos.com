//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveStreamingHeaderBasics
 * @description
 * The Awtsmoos gives byte length, retry identity, and raw header lookup an exact measured place;
 * Awtsmoos.com rejects malformed foundations before a streaming upload can reserve storage or enter public space.
 */

/**
 * @description Reads one incoming header case-insensitively and collapses array values to their first item.
 * @param {Object} headers - Incoming HTTP header map.
 * @param {string} name - Case-insensitive header name to resolve.
 * @returns {string} Canonical string value or an empty string when absent.
 */
function header(headers, name) {
	const found = Object.entries(headers || {}).find(([key]) => {
		return key.toLowerCase() === name.toLowerCase();
	});
	const value = found?.[1];

	if (Array.isArray(value)) {
		return String(value[0] || '');
	}

	return String(value || '');
}

/**
 * @description Validates exact nonnegative Content-Length before quota reservation and streaming begin.
 * @param {string} value - Raw Content-Length header value.
 * @returns {number} Safe integer byte count.
 * @throws {Error} When length is absent, malformed, unsafe, or negative.
 */
function contentLength(value) {
	if (!value) {
		throw policyError('LENGTH_REQUIRED', 411);
	}

	if (!/^\d+$/.test(String(value))) {
		throw policyError('CONTENT_LENGTH_INVALID', 400);
	}

	const bytes = Number(value);

	if (!Number.isSafeInteger(bytes) || bytes < 0) {
		throw policyError('CONTENT_LENGTH_INVALID', 400);
	}

	return bytes;
}

/**
 * @description Validates the retry identity that makes raw Drive uploads replay-safe.
 * @param {string} value - Raw Idempotency-Key header value.
 * @returns {string} Canonical nonempty idempotency key.
 * @throws {Error} When the key is absent or exceeds two hundred UTF-8 bytes.
 */
function idempotencyKey(value) {
	const key = String(value || '').trim();

	if (!key) {
		throw policyError('IDEMPOTENCY_KEY_REQUIRED', 400);
	}

	if (Buffer.byteLength(key, 'utf8') > 200) {
		throw policyError('IDEMPOTENCY_KEY_TOO_LONG', 400);
	}

	return key;
}

/**
 * @description Constructs an HTTP-aware Drive policy error without leaking internal stack state.
 * @param {string} code - Stable Drive error code.
 * @param {number} statusCode - HTTP status associated with the policy rejection.
 * @returns {Error} Error carrying code and statusCode properties.
 */
function policyError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	contentLength,
	header,
	idempotencyKey,
	policyError
};
