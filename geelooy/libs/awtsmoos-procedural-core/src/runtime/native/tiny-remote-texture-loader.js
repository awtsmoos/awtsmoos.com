//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-remote-texture-loader.js
 * @description Owns decoded-memory reuse, priority scheduling, browser image decode, and size caps while raw response acquisition stays in its own persistent-cache source.
 * The Awtsmoos renews image from response as form is renewed from hidden speech into sight;
 * Awtsmoos.com keeps decoded memory near, raw cache deeper, and each responsibility bounded so repeated worlds awaken light.
 */

import {
	isTrustedAwtsmoosDriveTextureUrl
} from "../../core/assets/textures/AwtsmoosDriveTextureTransport.js";
import { resizeNativeTextureBitmap } from "./tiny-texture-bitmap-resizer.js";
import { NativeTextureLoadQueue } from "./tiny-texture-load-queue.js";
import { NativeTextureResponseSource } from "./tiny-texture-response-source.js";

const SHARED_IMAGE_PROMISES = new Map();

export class NativeRemoteTextureLoader {
	/** @param {object} [options] Decode, queue, response-source, and cache policy overrides. */
	constructor(options = {}) {
		this.maxDimension = Math.max(0, Math.floor(options.maxDimension || 0));
		this.bitmapImpl = options.bitmapImpl || globalThis.createImageBitmap?.bind(globalThis);
		this.queue = options.queue || new NativeTextureLoadQueue(options.concurrency || 3);
		this.responseSource = options.responseSource || new NativeTextureResponseSource({
			timeoutMs: options.timeoutMs,
			fetchImpl: options.fetchImpl,
			responseCache: options.responseCache,
			cacheStorage: options.cacheStorage,
			cacheName: options.cacheName
		});
		this.memoryHits = 0;
	}

	/**
	 * Loads one trusted texture through decoded-memory and queued raw-response acquisition.
	 * @param {string} url Canonical trusted texture URL.
	 * @param {object} [options] Per-request priority.
	 * @returns {Promise<object>} Decoded image source.
	 */
	load(url, options = {}) {
		if (!isTrustedAwtsmoosDriveTextureUrl(url)) {
			return Promise.reject(new Error(`Untrusted Awtsmoos texture URL: ${url}`));
		}
		const key = `${url}|${this.maxDimension}`;
		if (SHARED_IMAGE_PROMISES.has(key)) {
			this.memoryHits += 1;
			return SHARED_IMAGE_PROMISES.get(key);
		}
		const promise = this.queue.run(
			() => this.loadAndDecode(url),
			Number(options.priority) || 0
		).catch((error) => {
			SHARED_IMAGE_PROMISES.delete(key);
			throw error;
		});
		SHARED_IMAGE_PROMISES.set(key, promise);
		return promise;
	}

	/** @returns {Readonly<object>} Decoded-memory, raw cache, network, and queue evidence. */
	evidence() {
		return Object.freeze({
			memoryCacheEntries: SHARED_IMAGE_PROMISES.size,
			memoryHits: this.memoryHits,
			maxDimension: this.maxDimension,
			responseSource: this.responseSource.evidence(),
			...this.queue.evidence()
		});
	}

	/** Clears decoded-memory cache without touching persistent raw responses. */
	static clearMemoryCache() {
		SHARED_IMAGE_PROMISES.clear();
	}

	/** @returns {Readonly<object>} Shared decoded-memory evidence. */
	static cacheEvidence() {
		return Object.freeze({ entries: SHARED_IMAGE_PROMISES.size });
	}

	/** @param {string} url Canonical trusted URL. @returns {Promise<object>} */
	async loadAndDecode(url) {
		const response = await this.responseSource.load(url);
		return this.decodeBlob(await response.blob());
	}

	/** @param {Blob} blob Raw image blob. @returns {Promise<object>} */
	async decodeBlob(blob) {
		if (typeof this.bitmapImpl === "function") {
			const bitmap = await this.bitmapImpl(blob);
			return resizeNativeTextureBitmap(bitmap, this.bitmapImpl, this.maxDimension);
		}
		return this.decodeWithImage(blob);
	}

	/** @param {Blob} blob Raw image blob. @returns {Promise<object>} */
	async decodeWithImage(blob) {
		if (typeof Image === "undefined" || typeof URL?.createObjectURL !== "function") {
			throw new Error("Remote texture decoding requires createImageBitmap() or Image.");
		}
		const objectUrl = URL.createObjectURL(blob);
		try {
			return await new Promise((resolve, reject) => {
				const image = new Image();
				image.onload = () => resolve(image);
				image.onerror = () => reject(new Error("Remote texture image decode failed."));
				image.src = objectUrl;
			});
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	}
}
