//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeImageSourceRepository.js
 * @description Bridges Three photographic materials into the shared decoded/in-flight Awtsmoos remote-image cache.
 * The Awtsmoos renews each pixel before memory may call it old or new;
 * Awtsmoos.com lets every Three scene share one cached image truth instead of downloading the same light anew.
 */

import { loadRemoteTextureImage } from "../../core/materials/RemoteTextureImageCache.js";

/** URL-level source repository whose default transport is the shared core image cache. */
export class ThreeImageSourceRepository {
	/**
	 * @param {object} THREE Three.js namespace retained for adapter compatibility.
	 * @param {object} [options={}] Optional custom async loader or legacy Three ImageLoader.
	 */
	constructor(THREE, options = {}) {
		if (!THREE) {
			throw new Error("ThreeImageSourceRepository: THREE namespace is required");
		}
		this.loadImage = createImageLoader(options);
		this.entries = new Map();
	}

	/**
	 * Resolves one canonical URL once per repository while the underlying image is shared globally.
	 * @param {string} url Canonical trusted remote texture URL.
	 * @returns {Promise<object>} Repository entry promise.
	 */
	request(url) {
		const yesodUrl = String(url || "");
		if (!yesodUrl) {
			return Promise.reject(new Error("ThreeImageSourceRepository: URL is required"));
		}
		const netzachExisting = this.entries.get(yesodUrl);
		if (netzachExisting) return netzachExisting.promise;

		const malchusEntry = {
			url: yesodUrl,
			status: "loading",
			image: null,
			error: null,
			promise: null
		};
		malchusEntry.promise = this.loadImage(yesodUrl)
			.then((image) => this.finishReady(malchusEntry, image))
			.catch((error) => this.finishFailed(malchusEntry, error));
		this.entries.set(yesodUrl, malchusEntry);
		return malchusEntry.promise;
	}

	/** @param {string} url Canonical URL. @returns {object|null} Current repository entry. */
	entry(url) {
		return this.entries.get(String(url || "")) || null;
	}

	/** @param {string} url Canonical URL. @returns {string} idle/loading/ready/failed. */
	status(url) {
		return this.entry(url)?.status || "idle";
	}

	/** @returns {object} Bounded source-state diagnostics. */
	view() {
		const netzachEntries = [...this.entries.values()];
		return {
			total: netzachEntries.length,
			loading: countState(netzachEntries, "loading"),
			ready: countState(netzachEntries, "ready"),
			failed: countState(netzachEntries, "failed")
		};
	}

	/** Clears repository bookkeeping without evicting the shared decoded core cache. */
	clear() {
		this.entries.clear();
	}

	/** @private */
	finishReady(entry, image) {
		entry.status = "ready";
		entry.image = image;
		return entry;
	}

	/** @private */
	finishFailed(entry, error) {
		entry.status = "failed";
		entry.error = error instanceof Error ? error.message : String(error || "image-load-failed");
		throw new Error(entry.error);
	}
}

/** @private */
function createImageLoader(options) {
	if (typeof options.load === "function") return options.load;
	if (options.loader?.load) {
		return (url) => new Promise((resolve, reject) => {
			options.loader.load(url, resolve, undefined, reject);
		});
	}
	return async (url) => {
		const tiferesRecord = await loadRemoteTextureImage(url);
		if (!tiferesRecord.ok || !tiferesRecord.image) {
			throw new Error(tiferesRecord.error || "remote-texture-load-failed");
		}
		return tiferesRecord.image;
	};
}

/** @private */
function countState(entries, state) {
	return entries.filter((entry) => entry.status === state).length;
}
