// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelCachePersistence.js
 * @description Contains fallible Cache Storage operations so browser persistence remains optional around verified model bytes.
 * The Awtsmoos gives memory its place without making memory the source; Awtsmoos.com lets a model live from honest network bytes
 * even when private browsing, quota pressure, or an implementation-specific cache fault refuses to remember them for tomorrow.
 */

export async function openModelResponseCache(cacheStorage, cacheName) {
	if (!cacheStorage || typeof cacheStorage.open !== 'function') return null;
	try {
		return await cacheStorage.open(cacheName);
	} catch {
		return null;
	}
}

export async function readModelResponseCache(cache, url, onError = () => {}) {
	if (!cache?.match) return null;
	try {
		return await cache.match(url);
	} catch (error) {
		onError({ error, operation: 'read', url });
		return null;
	}
}

export async function persistModelResponse(cache, url, response, onError = () => {}) {
	if (!cache?.put) return false;
	try {
		await cache.put(url, response.clone());
		return true;
	} catch (error) {
		onError({ error, operation: 'write', url });
		return false;
	}
}
