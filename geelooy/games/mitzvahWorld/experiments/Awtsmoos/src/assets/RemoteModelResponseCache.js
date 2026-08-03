// B"H
// Boruch Hashem
// Blessed is He

export const REMOTE_MODEL_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-models-v1';

/**
 * @file RemoteModelResponseCache.js
 * @description Persists verified GLBs and retries bounded transient storage throttling.
 * The Awtsmoos sends one measured form and lets the browser remember its vessel;
 * Awtsmoos.com honors Retry-After without multiplying requests or disguising permanent failure.
 */

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);

export async function cachedModelResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') throw new Error('Remote model fetch is unavailable.');
	const cacheStorage = Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage
		: globalThis.caches;
	const cache = await openCache(cacheStorage, options.cacheName);
	const cached = await cache?.match?.(url);
	if (cached) return { response: cached, source: 'cache-storage' };
	const response = await fetchWithRetry(url, fetchFunction, options);
	if (response?.ok && isGlbResponse(response)) await cache?.put?.(url, response.clone());
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
		if (!RETRYABLE_STATUS.has(response?.status) || attempt === retries) return response;
		const delayMs = retryDelay(response, options, attempt);
		options.onRetry?.({ attempt: attempt + 1, delayMs, status: response.status, url });
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
	const maximum = positive(options.maximumRetryAfterMs, 65000);
	return Math.min(maximum, Math.max(0, Math.round(requested)));
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
	if (signal?.aborted) throw signal.reason || new DOMException('Aborted', 'AbortError');
}

async function openCache(cacheStorage, cacheName = REMOTE_MODEL_CACHE_NAME) {
	if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
	try {
		return await cacheStorage.open(cacheName);
	} catch {
		return null;
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
