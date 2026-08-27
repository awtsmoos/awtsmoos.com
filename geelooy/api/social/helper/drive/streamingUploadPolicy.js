//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos measures a stream before its first byte begins to descend;
 * Awtsmoos.com requires length and idempotency so retries safely end.
 */

const crypto = require('crypto');

function parseStreamingUpload(request) {
	const headers = request?.headers || {};
	return {
		bytes: contentLength(headers['content-length']),
		idempotencyKey: idempotencyKey(headers['idempotency-key']),
		mime: header(headers, 'x-drive-mime') || header(headers, 'content-type'),
		visibility: header(headers, 'x-drive-visibility') === 'public' ? 'public' : 'private',
		cachePolicy: header(headers, 'x-drive-cache-policy') === 'immutable'
			? 'immutable'
			: 'mutable',
		requestId: header(headers, 'x-request-id') || null
	};
}

function contentLength(value) {
	if (value === undefined) throw policyError('LENGTH_REQUIRED', 411);
	if (!/^\d+$/.test(String(value))) throw policyError('CONTENT_LENGTH_INVALID', 400);
	const bytes = Number(value);
	if (!Number.isSafeInteger(bytes) || bytes < 0) {
		throw policyError('CONTENT_LENGTH_INVALID', 400);
	}
	return bytes;
}

function idempotencyKey(value) {
	const key = String(value || '').trim();
	if (!key) throw policyError('IDEMPOTENCY_KEY_REQUIRED', 400);
	if (Buffer.byteLength(key, 'utf8') > 200) {
		throw policyError('IDEMPOTENCY_KEY_TOO_LONG', 400);
	}
	return key;
}

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

function recordKey(value) {
	return `stream:${crypto.createHash('sha256').update(value).digest('hex')}`;
}

function header(headers, name) {
	const value = headers[name];
	return Array.isArray(value) ? String(value[0] || '') : String(value || '');
}

function policyError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	parseStreamingUpload,
	uploadFingerprint,
	recordKey,
	policyError
};
