//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-texture-response-source.js
 * @description Resolves one trusted raw texture response from persistent Cache Storage first, then browser HTTP cache/network, with write-through persistence and bounded timeout.
 * The Awtsmoos renews every byte before one request can cross from hidden source into visible form;
 * Awtsmoos.com asks memory first, then the wire, so repeated worlds inherit downloaded stone without paying the same journey once more.
 */

import { NativeTextureResponseCache } from "./tiny-texture-response-cache.js";

export class NativeTextureResponseSource {
	/** @param {object} [options] Fetch, cache, timeout, and namespace overrides. */
	constructor(options = {}) {
		this.timeoutMs = Math.max(5000, options.timeoutMs || 30000);
		this.fetchImpl = options.fetchImpl || globalThis.fetch?.bind(globalThis);
		this.responseCache = options.responseCache || new NativeTextureResponseCache({
			cacheStorage: options.cacheStorage,
			cacheName: options.cacheName
		});
		this.networkFetches = 0;
	}

	/**
	 * Resolves a raw image response through persistent cache before network.
	 * @param {string} url Canonical remote texture URL.
	 * @returns {Promise<Response>} Cached or freshly fetched response.
	 */
	async load(url) {
		const cached = await this.responseCache.match(url);
		if (cached) return cached;
		return this.fetchRemote(url);
	}

	/** @returns {Readonly<object>} Raw-response cache and network evidence. */
	evidence() {
		return Object.freeze({
			networkFetches: this.networkFetches,
			persistent: this.responseCache.evidence()
		});
	}

	/** @param {string} url Canonical remote texture URL. @returns {Promise<Response>} */
	async fetchRemote(url) {
		if (typeof this.fetchImpl !== "function") {
			throw new Error("Remote texture loading requires fetch().");
		}
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), this.timeoutMs);
		try {
			this.networkFetches += 1;
			const response = await this.fetchImpl(url, {
				signal: controller.signal,
				mode: "cors",
				credentials: "omit",
				cache: "force-cache"
			});
			if (!response.ok) {
				throw new Error(`Texture HTTP ${response.status}: ${url}`);
			}
			await this.responseCache.put(url, response);
			return response;
		} finally {
			clearTimeout(timer);
		}
	}
}
