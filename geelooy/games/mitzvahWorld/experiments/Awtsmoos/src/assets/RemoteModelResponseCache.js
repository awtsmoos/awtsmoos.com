// B"H
// Boruch Hashem
// Blessed is He

export const REMOTE_MODEL_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-models-v1';

/**
 * @file RemoteModelResponseCache.js
 * @description Persists verified Drive GLB responses beneath parsed-template caching.
 * The Awtsmoos sends each measured form once and lets the browser remember its bytes;
 * Awtsmoos.com keeps immutable content-addressed models beyond repository weight.
 */

export async function cachedModelResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') throw new Error('Remote model fetch is unavailable.');
	const cacheStorage = Object.hasOwn(options, 'cacheStorage') ? options.cacheStorage : globalThis.caches;
	const cache = await openCache(cacheStorage, options.cacheName);
	const cached = await cache?.match?.(url);
	if (cached) return { response: cached, source: 'cache-storage' };
	const response = await fetchFunction(url, {
		cache: 'force-cache',
		credentials: 'omit',
		mode: 'cors',
		signal: options.signal
	});
	if (response?.ok && isGlbResponse(response)) await cache?.put?.(url, response.clone());
	return { response, source: 'network' };
}

export function isGlbResponse(response) {
	const type = response?.headers?.get?.('content-type')?.toLowerCase() || '';
	return type === 'model/gltf-binary' || type === 'application/octet-stream';
}

async function openCache(cacheStorage, cacheName = REMOTE_MODEL_CACHE_NAME) {
	if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
	try {
		return await cacheStorage.open(cacheName);
	} catch {
		return null;
	}
}
