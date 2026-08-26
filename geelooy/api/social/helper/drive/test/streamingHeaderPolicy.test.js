//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file streamingHeaderPolicy.test.js
 * @description
 * The Awtsmoos gives raw HTTP intent a bounded vessel before bytes can flow into storage;
 * Awtsmoos.com tests exact length, idempotency, MIME, visibility, cache policy, and explicit-metadata signals at that door.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseStreamingUpload } = require('../streamingUploadPolicy.js');

test('parses private mutable defaults from a minimal valid streaming request', testDefaults);
test('preserves explicit public immutable upload intent', testPublicImmutable);
test('rejects malformed visibility and cache headers', testInvalidMetadata);
test('requires content length and idempotency identity', testRequiredHeaders);

/**
 * @description Creates the minimal request shape accepted by streaming upload policy and allows selected header overrides.
 * @param {Object} [overrides={}] - Headers that should replace or extend the valid defaults.
 * @returns {Object} Request fixture containing normalized test headers.
 */
function requestWith(overrides = {}) {
	return {
		headers: {
			'content-length': '1234',
			'idempotency-key': 'sample-upload-1',
			'content-type': 'audio/mpeg',
			...overrides
		}
	};
}

/**
 * @description Verifies a minimal request becomes private/mutable without claiming those metadata fields were explicitly supplied.
 * @returns {void}
 */
function testDefaults() {
	const upload = parseStreamingUpload(requestWith());
	assert.equal(upload.bytes, 1234);
	assert.equal(upload.idempotencyKey, 'sample-upload-1');
	assert.equal(upload.mime, 'audio/mpeg');
	assert.equal(upload.visibility, 'private');
	assert.equal(upload.cachePolicy, 'mutable');
	assert.equal(upload.visibilityExplicit, false);
	assert.equal(upload.cachePolicyExplicit, false);
}

/**
 * @description Verifies explicit public/immutable headers survive parsing and mark both metadata dimensions as explicit.
 * @returns {void}
 */
function testPublicImmutable() {
	const upload = parseStreamingUpload(requestWith({
		'x-drive-visibility': 'public',
		'x-drive-cache-policy': 'immutable'
	}));

	assert.equal(upload.visibility, 'public');
	assert.equal(upload.cachePolicy, 'immutable');
	assert.equal(upload.visibilityExplicit, true);
	assert.equal(upload.cachePolicyExplicit, true);
}

/**
 * @description Verifies malformed public/cache metadata is rejected instead of silently downgraded to defaults.
 * @returns {void}
 */
function testInvalidMetadata() {
	assert.throws(() => parseStreamingUpload(requestWith({ 'x-drive-visibility': 'everyone' })), /VISIBILITY_INVALID/);
	assert.throws(() => parseStreamingUpload(requestWith({ 'x-drive-cache-policy': 'forever-ish' })), /CACHE_POLICY_INVALID/);
}

/**
 * @description Verifies raw streaming requests cannot reserve storage without exact length and replay identity.
 * @returns {void}
 */
function testRequiredHeaders() {
	assert.throws(() => parseStreamingUpload({ headers: { 'idempotency-key': 'x' } }), /LENGTH_REQUIRED/);
	assert.throws(() => parseStreamingUpload({ headers: { 'content-length': '5' } }), /IDEMPOTENCY_KEY_REQUIRED/);
}
