// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicImageResponseCache.js
 * @description Persists verified remote image responses beneath decoded-image memory caches.
 * The Awtsmoos sends one distant garment and lets the browser remember its bytes;
 * Awtsmoos.com avoids copied repository pixels while repeated visits reuse cached light.
 */

export const PUBLIC_IMAGE_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-images-v1';

/**
 * Returns a cached response or fetches and stores one trusted remote image response.
 *
 * @param {string} url - Canonical remote texture URL.
 * @param {object} options - Fetch, Cache Storage, and abort dependencies.
 * @returns {Promise<{response: Response, source: string}>}
 */
export async function cachedImageResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') {
		throw new Error('Remote image fetch is unavailable.');
	}
	const cacheStorage = Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage
		: globalThis.caches;
	const cache = await openCache(cacheStorage, options.cacheName);
	const cached = await cache?.match?.(url);
	if (cached) return { response: cached, source: 'cache-storage' };
	const response = await fetchFunction(url, {
		cache: 'force-cache',
		credentials: 'omit',
		mode: 'cors',
		signal: options.signal
	});
	if (response?.ok && isImageResponse(response)) {
		await cache?.put?.(url, response.clone());
	}
	return { response, source: 'network' };
}

export function isImageResponse(response) {
	const contentType = response?.headers?.get?.('content-type') || '';
	return contentType.toLowerCase().startsWith('image/');
}

async function openCache(cacheStorage, cacheName = PUBLIC_IMAGE_CACHE_NAME) {
	if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
	try {
		return await cacheStorage.open(cacheName);
	} catch {
		return null;
	}
}
