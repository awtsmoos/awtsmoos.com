// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageFetch.js
 * @description Fetches one canonical image with cache reuse and one bounded retry doorway.
 * The Awtsmoos gives every distant byte a truthful and patient way;
 * Awtsmoos.com retries with measure while cached or procedural light may stay.
 */

import {
	cachedImageResponse,
	isImageResponse
} from './PublicImageResponseCache.js';
import {
	createPublicImageAbortController,
	publicImageCacheOptions
} from './PublicImageFetchDependencies.js';
import {
	publicImageAttemptEvidence,
	publicImageFetchFailure,
	publicImageFetchSuccess,
	publicImageNetworkFailure,
	publicImageTypedFailure
} from './PublicImageFetchRecords.js';
import {
	imageRetryDelayMs,
	isRetryableImageStatus,
	waitForImageRetry
} from './PublicImageRetryPolicy.js';

export async function fetchPublicImageBlob(url, timeoutMs = 30000, dependencies = {}) {
	const controller = createPublicImageAbortController(dependencies);
	const timer = setTimeout(() => controller?.abort(), timeoutMs);
	const attempts = [];
	const maximumRetries = Math.max(0, Number(dependencies.maxRetries ?? 1) || 0);
	try {
		for (let attempt = 0; attempt <= maximumRetries; attempt += 1) {
			const record = await requestAttempt(url, controller, attempt, dependencies)
				.catch(error => publicImageNetworkFailure(error, controller));
			attempts.push(publicImageAttemptEvidence(record));
			if (record.ok) return publicImageFetchSuccess(record, attempts);
			if (!record.retryable || attempt >= maximumRetries) {
				return publicImageFetchFailure(record, attempts);
			}
			const delayMs = imageRetryDelayMs(record.response, attempt, dependencies);
			await waitForImageRetry(delayMs, dependencies);
		}
		return publicImageFetchFailure({ error: 'retry-budget-exhausted' }, attempts);
	} finally {
		clearTimeout(timer);
	}
}

async function requestAttempt(url, controller, attempt, dependencies) {
	const result = await cachedImageResponse(
		url,
		publicImageCacheOptions(controller, attempt, dependencies)
	);
	const response = result.response;
	const contentType = response?.headers?.get?.('content-type') || '';
	if (!response?.ok) return httpFailure(response, contentType, result);
	if (!isImageResponse(response)) {
		return publicImageTypedFailure(
			'non-image-content-type',
			contentType,
			response,
			result.source
		);
	}
	const blob = await response.blob();
	if (!blob?.size) {
		return publicImageTypedFailure(
			'empty-image-blob',
			contentType,
			response,
			result.source
		);
	}
	return successAttempt(blob, contentType, response, result.source);
}

function httpFailure(response, contentType, result) {
	return {
		contentType,
		error: `http-${response?.status || 0}`,
		method: result.source,
		ok: false,
		response,
		retryAfterMs: result.retryAfterMs,
		retryable: !result.circuitOpen && isRetryableImageStatus(response?.status),
		stage: 'http',
		status: response?.status || 0
	};
}

function successAttempt(blob, contentType, response, method) {
	return {
		blob,
		contentType,
		error: null,
		method,
		ok: true,
		response,
		retryAfterMs: 0,
		retryable: false,
		stage: 'fetched',
		status: response.status
	};
}
