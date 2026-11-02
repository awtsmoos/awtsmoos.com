// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteModelResponseCache.js
 * @description Reuses the authenticated canonical warmup and keeps remote cache/retry authoritative on failure.
 * The Awtsmoos carries one real Chossid across two bundle horizons; Awtsmoos.com never mistakes
 * a speculative promise for truth, returning to verified source bytes whenever it falls away.
 */

import {
	openModelResponseCache,
	persistModelResponse,
	readModelResponseCache
} from './RemoteModelCachePersistence.js';
import { isTrustedReleaseModelUrl } from './ReleaseModelCatalog.js';
import { takeCanonicalChossidWarmup } from './CanonicalChossidFetchBridge.js';
import { fetchModelWithRetry } from './RemoteModelFetchRetry.js';

export const REMOTE_MODEL_CACHE_NAME = 'awtsmoos-mitzvah-world-remote-models-v1';

/** Reads optional Cache Storage and claims a shared canonical fetch, falling back to old bounded retries. */
export async function cachedModelResponse(url, options = {}) {
	const fetchFunction = options.fetchFunction || globalThis.fetch;
	if (typeof fetchFunction !== 'function') throw new Error('Remote model fetch is unavailable.');
	const cacheStorage = Object.hasOwn(options, 'cacheStorage')
		? options.cacheStorage : globalThis.caches;
	const cache = await openModelResponseCache(
		cacheStorage,
		options.cacheName || REMOTE_MODEL_CACHE_NAME
	);
	const reportCacheError = receipt => options.onCacheError?.(receipt);
	const warmup = isTrustedReleaseModelUrl(url) ? takeCanonicalChossidWarmup(url) : null;
	if (warmup) {
		try {
			const bytes = await warmup;
			if (options.signal?.aborted) throw options.signal.reason || new Error('model-fetch-aborted');
			const response = new Response(bytes, {
				headers: { 'content-type': 'model/gltf-binary', 'content-length': String(bytes.byteLength) }
			});
			await persistModelResponse(cache, url, response, reportCacheError);
			return { response, source: 'canonical-warmup' };
		} catch {
			// The canonical loader must retry independently when the speculative road fails.
		}
	}
	const cached = await readModelResponseCache(cache, url, reportCacheError);
	if (cached) return { response: cached, source: 'cache-storage' };
	const response = await fetchModelWithRetry(url, fetchFunction, options);
	if (response?.ok && isGlbResponse(response)) {
		await persistModelResponse(cache, url, response, reportCacheError);
	}
	return { response, source: 'network' };
}

/** Preserves the existing trusted binary content-type policy. */
export function isGlbResponse(response) {
	const type = response?.headers?.get?.('content-type')?.toLowerCase() || '';
	return type === 'model/gltf-binary' || type === 'application/octet-stream';
}
