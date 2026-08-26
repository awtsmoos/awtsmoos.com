//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveStreamingHeaderMetadata
 * @description
 * The Awtsmoos distinguishes private from public and mutable from immutable without silent translation;
 * Awtsmoos.com gives MIME, visibility, and cache intent strict names before authorization or publication.
 */

const { policyError } = require('./streamingHeaderBasics.js');

/**
 * @description Validates explicit Drive visibility instead of silently downgrading malformed public intent.
 * @param {string} value - Raw X-Drive-Visibility header value.
 * @returns {'private'|'public'} Canonical visibility, defaulting to private when absent.
 * @throws {Error} When a nonempty unsupported visibility is supplied.
 */
function parseVisibility(value) {
	if (!value) {
		return 'private';
	}

	if (value === 'private' || value === 'public') {
		return value;
	}

	throw policyError('VISIBILITY_INVALID', 400);
}

/**
 * @description Validates mutable versus immutable cache intent before the object can become publicly addressable.
 * @param {string} value - Raw X-Drive-Cache-Policy header value.
 * @returns {'mutable'|'immutable'} Canonical cache policy, defaulting to mutable.
 * @throws {Error} When a nonempty unsupported cache policy is supplied.
 */
function parseCachePolicy(value) {
	if (!value) {
		return 'mutable';
	}

	if (value === 'mutable' || value === 'immutable') {
		return value;
	}

	throw policyError('CACHE_POLICY_INVALID', 400);
}

/**
 * @description Bounds and normalizes the caller-declared MIME type used by public and private responses.
 * @param {string} value - Raw Drive MIME or Content-Type header value.
 * @returns {string} MIME value or application/octet-stream when empty.
 * @throws {Error} When the MIME declaration exceeds two hundred UTF-8 bytes.
 */
function mimeType(value) {
	const mime = String(value || 'application/octet-stream').trim();

	if (Buffer.byteLength(mime, 'utf8') > 200) {
		throw policyError('MIME_TOO_LONG', 400);
	}

	return mime || 'application/octet-stream';
}

module.exports = {
	mimeType,
	parseCachePolicy,
	parseVisibility
};
