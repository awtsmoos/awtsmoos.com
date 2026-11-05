// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicMaterialImageRecords.js
 * @description Builds durable image-decoding receipts with retry and rate-limit provenance.
 * The Awtsmoos lets every texture doorway confess what it tried and knew;
 * Awtsmoos.com preserves cache, retry, timing, dimensions, and failure in view.
 */

export function serializableImageRecord(record) {
	return {
		attempts: (record.attempts || []).map(attempt => ({ ...attempt })),
		contentType: record.contentType || '',
		durationMs: record.durationMs,
		error: record.error || null,
		fromCache: Boolean(record.fromCache),
		height: record.height,
		method: record.method || null,
		ok: record.ok,
		rateLimited: Boolean(record.rateLimited),
		retries: record.retries || 0,
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || null,
		status: record.status || 0,
		url: record.url,
		width: record.width
	};
}

export function materialImageSuccess(values) {
	const { attempts, decoded, fetched, startedAt, url } = values;
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(values.now() - startedAt),
		error: null,
		fromCache: fetched?.method === 'cache-storage',
		height: decoded.height,
		image: decoded.image,
		method: decoded.method,
		ok: true,
		rateLimited: Boolean(fetched?.rateLimited),
		retries: fetched?.retries || 0,
		retryAfterMs: fetched?.retryAfterMs || 0,
		stage: 'decoded',
		status: fetched?.status || 200,
		url,
		width: decoded.width
	};
}

export function materialImageFailure(values) {
	const { attempts, direct, fetched, startedAt, url } = values;
	const final = attempts.at(-1) || {};
	return {
		attempts,
		contentType: fetched?.contentType || '',
		durationMs: Math.round(values.now() - startedAt),
		error: final.error || direct.error || fetched?.error || 'image-load-failed',
		fromCache: false,
		height: 0,
		image: null,
		method: final.method || 'none',
		ok: false,
		rateLimited: Boolean(fetched?.rateLimited),
		retries: fetched?.retries || 0,
		retryAfterMs: fetched?.retryAfterMs || 0,
		stage: final.stage || 'unknown',
		status: fetched?.status || 0,
		url,
		width: 0
	};
}

export function materialImageAttempt(record = {}) {
	return {
		contentType: record.contentType || '',
		error: record.error || null,
		method: record.method || 'none',
		ok: Boolean(record.ok),
		rateLimited: Boolean(record.rateLimited),
		retries: record.retries || 0,
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || 'unknown',
		status: record.status || 0
	};
}
