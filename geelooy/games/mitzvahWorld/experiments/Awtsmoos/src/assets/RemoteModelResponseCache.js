// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelResponseCache.js
 * @description Fetches verified GLBs with bounded retry while delegating optional browser persistence to a non-authoritative cache vessel.
 * The Awtsmoos gives the living form before its remembered vessel; Awtsmoos.com lets cache serve the download rather than judge it,
 * so privacy mode, quota pressure, or rejected Cache.put calls can never erase a successfully fetched Chossid.
 */

import {
	openModelResponseCache,
	persistModelResponse,
	readModelResponseCache
} from './RemoteModelCachePersistence.js';

export const REMOTE_MODEL_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-models-v1';
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

export async function cachedModelResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') {
		throw new Error('Remote model fetch is unavailable.');
	}
	const cacheStorage = Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage
		: globalThis.caches;
	const cache = await openModelResponseCache(
		cacheStorage,
		options.cacheName || REMOTE_MODEL_CACHE_NAME
	);
	const reportCacheError = receipt => options.onCacheError?.(receipt);
	const cached = await readModelResponseCache(cache, url, reportCacheError);
	if (cached) return { response: cached, source: 'cache-storage' };
	const response = await fetchWithRetry(url, fetchFunction, options);
	if (response?.ok && isGlbResponse(response)) {
		await persistModelResponse(cache, url, response, reportCacheError);
	}
	return { response, source: 'network' };
}

export function isGlbResponse(response) {
	const type = response?.headers?.get?.('content-type')?.toLowerCase() || '';
	return type === 'model/gltf-binary' || type === 'application/octet-stream';
}

async function fetchWithRetry(url, fetchFunction, options) {
	const retries = nonnegative(options.transientRetries, 2);
	for (let attempt = 0; attempt <= retries; attempt += 1) {
		assertNotAborted(options.signal);
		const response = await fetchFunction(url, fetchOptions(options.signal));
		if (!RETRYABLE_STATUS.has(response?.status) || attempt === retries) {
			return response;
		}
		const delayMs = retryDelay(response, options, attempt);
		options.onRetry?.({
			attempt: attempt + 1,
			delayMs,
			status: response.status,
			url
		});
		await waitForRetry(delayMs, options);
	}
	throw new Error('Remote model retry loop ended unexpectedly.');
}

function fetchOptions(signal) {
	return {
		cache: 'force-cache',
		credentials: 'omit',
		mode: 'cors',
		signal
	};
}

function retryDelay(response, options, attempt) {
	const retryAfter = String(response?.headers?.get?.('retry-after') || '').trim();
	const seconds = Number(retryAfter);
	const requested = Number.isFinite(seconds) && seconds >= 0
		? seconds * 1000
		: Math.min(30000, 1000 * (2 ** attempt));
	return Math.min(
		positive(options.maximumRetryAfterMs, 65000),
		Math.max(0, Math.round(requested))
	);
}

function waitForRetry(milliseconds, options) {
	const waitFunction = options.waitFunction || defaultWait;
	return waitFunction(milliseconds, options.signal);
}

function defaultWait(milliseconds, signal) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, milliseconds);
		signal?.addEventListener?.('abort', () => {
			clearTimeout(timer);
			reject(signal.reason || new DOMException('Aborted', 'AbortError'));
		}, { once: true });
	});
}

function assertNotAborted(signal) {
	if (signal?.aborted) {
		throw signal.reason || new DOMException('Aborted', 'AbortError');
	}
}

function nonnegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
