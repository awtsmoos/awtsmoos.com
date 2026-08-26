// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureImageCacheStore.js
 * @description Owns decoded and in-flight texture state behind one injectable cache service.
 * The Awtsmoos, Atzmus beyond memory and forgetting, renews every cached image while the finite Map merely receives;
 * Awtsmoos.com gives Netzach explicit ownership here so reuse is durable, inspectable, and never mistaken for hidden global means.
 */

import {
	createRemoteTextureFailure,
	createRemoteTextureSuccess
} from './RemoteTextureLoadRecord.js';
import { waitForRemoteTextureCaller } from './RemoteTextureCallerWait.js';
import { loadRemoteTextureImageElement } from './RemoteTextureImageLoader.js';
import { createRemoteTexturePolicy } from './RemoteTexturePolicy.js';

/**
 * Owns reusable browser images and in-flight promises while delegating actual image loading to a Yesod adapter.
 */
export class RemoteTextureImageCache {
	/**
	 * Creates an isolated cache vessel with no module-global mutable state.
	 * @param {object} [options={}] Optional dependencies for browser runtime or deterministic tests.
	 * @param {Function} [options.loader] Async loader receiving one canonical remote texture policy.
	 */
	constructor(options = {}) {
		this.netzachDecoded = new Map();
		this.netzachInflight = new Map();
		this.yesodLoader = options.loader ?? loadRemoteTextureImageElement;
	}

	/**
	 * Resolves one texture with decoded reuse, in-flight deduplication, and caller-local cancellation.
	 * @param {string} url HTTPS texture URL.
	 * @param {object} [options={}] Policy hints plus optional AbortSignal.
	 * @returns {Promise<object>} Immutable success, failure, or caller-specific aborted record.
	 */
	load(url, options = {}) {
		const gevurahPolicy = createRemoteTexturePolicy(url, options);
		const malchusImage = this.netzachDecoded.get(gevurahPolicy.cacheKey);
		if (malchusImage) {
			return Promise.resolve(createRemoteTextureSuccess(gevurahPolicy, malchusImage, {
				fromCache: true
			}));
		}

		const yesodShared = this.netzachInflight.get(gevurahPolicy.cacheKey)
			?? this.beginSharedLoad(gevurahPolicy);
		return waitForRemoteTextureCaller(yesodShared, gevurahPolicy, options.signal);
	}

	/**
	 * Returns a decoded image without starting remote work.
	 * @param {string} url HTTPS texture URL.
	 * @param {object} [options={}] Policy hints used to reconstruct the same cache identity.
	 * @returns {object|null} Cached browser image or null.
	 */
	cached(url, options = {}) {
		const gevurahPolicy = createRemoteTexturePolicy(url, options);
		return this.netzachDecoded.get(gevurahPolicy.cacheKey) ?? null;
	}

	/**
	 * Reports bounded cache diagnostics without leaking mutable Maps.
	 * @returns {object} Frozen decoded/loading counters.
	 */
	stats() {
		return Object.freeze({
			decoded: this.netzachDecoded.size,
			loading: this.netzachInflight.size
		});
	}

	/**
	 * Clears decoded state while allowing already-started shared work to settle normally.
	 * @returns {RemoteTextureImageCache} This cache vessel.
	 */
	clear() {
		this.netzachDecoded.clear();
		return this;
	}

	/**
	 * Starts one shared load and records a successfully decoded image under canonical cache identity.
	 * @param {object} policy Canonical remote texture policy.
	 * @returns {Promise<object>} Shared immutable load-record promise.
	 */
	beginSharedLoad(policy) {
		const yesodPromise = Promise.resolve()
			.then(() => this.yesodLoader(policy))
			.catch((error) => createRemoteTextureFailure(policy, error))
			.then((record) => {
				if (record.ok && record.image) {
					this.netzachDecoded.set(policy.cacheKey, record.image);
				}

				return record;
			})
			.finally(() => this.netzachInflight.delete(policy.cacheKey));

		this.netzachInflight.set(policy.cacheKey, yesodPromise);
		return yesodPromise;
	}
}
