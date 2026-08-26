//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveStreamingUploadPolicy
 * @description The Awtsmoos measures each byte-river before it flows; Awtsmoos.com composes validated headers into one replayable fingerprint without hiding public intent.
 */

const crypto = require('crypto');
const {
	contentLength,
	header,
	idempotencyKey,
	mimeType,
	parseCachePolicy,
	parseVisibility,
	policyError
} = require('./streamingHeaderPolicy.js');

/**
 * @description Parses and validates the complete HTTP-header contract for one raw streaming Drive upload.
 * @param {Object} request - Incoming HTTP request containing upload headers.
 * @returns {Object} Canonical streaming-upload policy record.
 */
function parseStreamingUpload(request) {
	const headers = request?.headers || {};
	const visibilityValue = header(headers, 'x-drive-visibility');
	const cacheValue = header(headers, 'x-drive-cache-policy');
	return {
		bytes: contentLength(header(headers, 'content-length')),
		idempotencyKey: idempotencyKey(header(headers, 'idempotency-key')),
		mime: mimeType(header(headers, 'x-drive-mime') || header(headers, 'content-type')),
		visibility: parseVisibility(visibilityValue),
		cachePolicy: parseCachePolicy(cacheValue),
		visibilityExplicit: Boolean(visibilityValue),
		cachePolicyExplicit: Boolean(cacheValue),
		requestId: header(headers, 'x-request-id') || null
	};
}

/**
 * @description Creates a deterministic SHA-256 identity for the committed logical upload result.
 * @param {Object} options - Upload metadata including path, bytes, hash, MIME, visibility, and cache policy.
 * @returns {string} Hex SHA-256 fingerprint.
 */
function uploadFingerprint(options) {
	const canonical = JSON.stringify({
		path: options.path,
		bytes: options.bytes,
		hash: options.hash,
		mime: options.mime || null,
		visibility: options.visibility,
		cachePolicy: options.cachePolicy
	});
	return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * @description Hashes an external idempotency key into a bounded internal Drive state key.
 * @param {string} value - Caller-provided idempotency key.
 * @returns {string} Namespaced internal record key.
 */
function recordKey(value) {
	return `stream:${crypto.createHash('sha256').update(value).digest('hex')}`;
}

module.exports = {
	parseStreamingUpload,
	policyError,
	recordKey,
	uploadFingerprint
};
