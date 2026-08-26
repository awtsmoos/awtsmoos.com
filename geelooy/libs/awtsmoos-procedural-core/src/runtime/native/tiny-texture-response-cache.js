//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-texture-response-cache.js
 * @description Owns versioned persistent raw-response caching for native remote textures through browser Cache Storage when available.
 * The Awtsmoos renews every byte before memory may keep its trace, and Awtsmoos.com lets yesterday's downloaded stone serve today's road with grace;
 * cache failure remains only a missing convenience, never a reason for gameplay or visible fallback color to leave its place.
 */

export const NATIVE_TEXTURE_RESPONSE_CACHE_NAME = "awtsmoos-procedural-textures-v1";

export class NativeTextureResponseCache {
	/** @param {object} [options] Cache Storage dependency and namespace overrides. */
	constructor(options = {}) {
		this.cacheStorage = options.cacheStorage ?? globalThis.caches ?? null;
		this.cacheName = options.cacheName || NATIVE_TEXTURE_RESPONSE_CACHE_NAME;
		this.cachePromise = null;
		this.stats = {
			hits: 0,
			misses: 0,
			writes: 0,
			failures: 0,
			unavailable: 0
		};
	}

	/** @returns {boolean} Whether persistent Cache Storage is available. */
	get available() {
		return Boolean(this.cacheStorage?.open);
	}

	/**
	 * Reads one canonical URL from persistent raw-response cache.
	 * @param {string} url Canonical texture URL.
	 * @returns {Promise<Response|null>} Cached response clone or null.
	 */
	async match(url) {
		if (!this.available) {
			this.stats.unavailable += 1;
			this.stats.misses += 1;
			return null;
		}
		try {
			const cache = await this.openCache();
			const response = await cache.match(url);
			if (!response) {
				this.stats.misses += 1;
				return null;
			}
			this.stats.hits += 1;
			return response.clone?.() || response;
		} catch {
			this.stats.failures += 1;
			this.stats.misses += 1;
			return null;
		}
	}

	/**
	 * Persists one successful raw response without making cache failure fatal.
	 * @param {string} url Canonical texture URL.
	 * @param {Response} response Successful network response.
	 * @returns {Promise<boolean>} Whether persistence succeeded.
	 */
	async put(url, response) {
		if (!this.available || !response?.ok) return false;
		let storedResponse;
		try {
			storedResponse = response.clone?.() || response;
			const cache = await this.openCache();
			await cache.put(url, storedResponse);
			this.stats.writes += 1;
			return true;
		} catch {
			this.stats.failures += 1;
			return false;
		}
	}

	/** @returns {Readonly<object>} Persistent-cache evidence for diagnostics. */
	evidence() {
		return Object.freeze({
			cacheName: this.cacheName,
			available: this.available,
			...this.stats
		});
	}

	/** @returns {Promise<object>} Open browser cache, memoized per cache vessel. */
	openCache() {
		if (!this.cachePromise) {
			this.cachePromise = this.cacheStorage.open(this.cacheName).catch((error) => {
				this.cachePromise = null;
				throw error;
			});
		}
		return this.cachePromise;
	}
}
