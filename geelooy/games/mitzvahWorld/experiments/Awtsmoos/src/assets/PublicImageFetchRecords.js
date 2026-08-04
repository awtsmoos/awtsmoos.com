// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetchRecords.js
 * @description Builds serializable success, failure, and per-attempt image evidence.
 * The Awtsmoos lets every distant success and fracture speak without disguise;
 * Awtsmoos.com records retry, rate limit, method, stage, and status before our eyes.
 */

export function publicImageFetchSuccess(record, attempts) {
	return {
		...record,
		attempts,
		rateLimited: wasRateLimited(attempts),
		retries: retryCount(attempts)
	};
}

export function publicImageFetchFailure(record, attempts) {
	return {
		blob: null,
		contentType: record.contentType || '',
		error: record.error || 'network-error',
		method: record.method || 'remote-cache-fetch',
		ok: false,
		attempts,
		rateLimited: wasRateLimited(attempts),
		retries: retryCount(attempts),
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || 'fetch',
		status: record.status || 0
	};
}

export function publicImageAttemptEvidence(record = {}) {
	return {
		error: record.error || null,
		method: record.method || 'none',
		ok: Boolean(record.ok),
		retryAfterMs: record.retryAfterMs || 0,
		stage: record.stage || 'unknown',
		status: record.status || 0
	};
}

export function publicImageNetworkFailure(error, controller) {
	const aborted = error?.name === 'AbortError' || controller?.signal?.aborted;
	return {
		error: aborted ? 'timeout' : error?.message || 'network-error',
		method: 'network',
		ok: false,
		retryAfterMs: 0,
		retryable: !aborted,
		stage: 'fetch',
		status: 0
	};
}

export function publicImageTypedFailure(error, contentType, response, method) {
	return {
		contentType,
		error,
		method,
		ok: false,
		response,
		retryAfterMs: 0,
		retryable: false,
		stage: error === 'empty-image-blob' ? 'blob' : 'content-type',
		status: response.status
	};
}

function retryCount(attempts) {
	return Math.max(0, attempts.length - 1);
}

function wasRateLimited(attempts) {
	return attempts.some(attempt => attempt.status === 429);
}
