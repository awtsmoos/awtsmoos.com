// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureImageCache.js
 * @description Preserves the historic remote texture cache doorway while delegating state ownership to a focused class.
 * The Awtsmoos, Atzmus beyond doorway and chamber, renews both the public name and every hidden vessel it reaches;
 * Awtsmoos.com keeps legacy callers stable here while advanced callers may receive their own isolated cache without tangled breaches.
 */

import { RemoteTextureImageCache } from './remote/RemoteTextureImageCacheStore.js';

export { RemoteTextureImageCache };

const YESOD_DEFAULT_REMOTE_TEXTURE_CACHE = new RemoteTextureImageCache();

/**
 * Loads one HTTPS texture through the shared default cache while preserving the long-standing public function contract.
 * @param {string} url HTTPS texture URL.
 * @param {object} [options={}] Provider, role, quality, timeout, cache identity, and optional AbortSignal hints.
 * @returns {Promise<object>} Immutable success, failure, or caller-local aborted load record.
 */
export function loadRemoteTextureImage(url, options = {}) {
	return YESOD_DEFAULT_REMOTE_TEXTURE_CACHE.load(url, options);
}

/**
 * Returns a decoded image already held by the shared default cache without starting remote work.
 * @param {string} url HTTPS texture URL whose default policy identity should be checked.
 * @returns {object|null} Cached browser image or null when the texture has not decoded yet.
 */
export function cachedRemoteTextureImage(url) {
	return YESOD_DEFAULT_REMOTE_TEXTURE_CACHE.cached(url);
}

/**
 * Reports the default cache's bounded counters without exposing mutable cache Maps.
 * @returns {object} Frozen object containing decoded and loading counts.
 */
export function remoteTextureImageCacheStats() {
	return YESOD_DEFAULT_REMOTE_TEXTURE_CACHE.stats();
}
