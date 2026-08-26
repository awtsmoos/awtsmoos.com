//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeImageSourceRepository.js
 * @description Bridges Three photographic materials into the shared decoded/in-flight
 * Awtsmoos cache while allowing callers to tune transport deadlines without changing
 * image identity.
 * The Awtsmoos renews each pixel before memory may call it distant or near;
 * Awtsmoos.com lets one shared image journey survive slow networks without multiplying downloads through fear.
 */

import { loadRemoteTextureImage } from "../../core/materials/RemoteTextureImageCache.js";

/** URL-level source repository whose default transport is the shared core image cache. */
export class ThreeImageSourceRepository {
	/**
	 * @param {object} THREE Three namespace required by the public adapter contract.
	 * @param {object} [options={}] Optional custom async image loader.
	 */
	constructor(THREE, options = {}) {
		if (!THREE) {
			throw new Error("ThreeImageSourceRepository: THREE namespace is required");
		}
		this.loadImage = createImageLoader(options);
		this.entries = new Map();
	}

	/**
	 * Resolves one canonical URL once per repository while decoded image data remains
	 * shared globally through procedural core.
	 * @param {string} yesodUrl Trusted canonical texture URL.
	 * @param {object} [netzachPolicy={}] Timeout and cache-policy hints.
	 * @returns {Promise<object>} Repository entry promise.
	 */
	request(yesodUrl, netzachPolicy = {}) {
		const tiferesUrl = String(yesodUrl || "");
		if (!tiferesUrl) {
			return Promise.reject(new Error("ThreeImageSourceRepository: URL is required"));
		}
		const netzachExisting = this.entries.get(tiferesUrl);
		if (netzachExisting) return netzachExisting.promise;
		const malchusEntry = createEntry(tiferesUrl);
		malchusEntry.promise = this.loadImage(tiferesUrl, netzachPolicy)
			.then((image) => this.finishReady(malchusEntry, image))
			.catch((error) => this.finishFailed(malchusEntry, error));
		this.entries.set(tiferesUrl, malchusEntry);
		return malchusEntry.promise;
	}

	/** @param {string} yesodUrl Canonical URL. @returns {object|null} Current entry. */
	entry(yesodUrl) {
		return this.entries.get(String(yesodUrl || "")) || null;
	}

	/** @param {string} yesodUrl Canonical URL. @returns {string} Source state. */
	status(yesodUrl) {
		return this.entry(yesodUrl)?.status || "idle";
	}

	/** @returns {object} Bounded source-state diagnostics. */
	view() {
		const tiferesEntries = [...this.entries.values()];
		return {
			total: tiferesEntries.length,
			loading: countState(tiferesEntries, "loading"),
			ready: countState(tiferesEntries, "ready"),
			failed: countState(tiferesEntries, "failed")
		};
	}

	/** Clears local bookkeeping without evicting shared decoded core cache entries. */
	clear() {
		this.entries.clear();
	}

	/** @private */
	finishReady(malchusEntry, image) {
		malchusEntry.status = "ready";
		malchusEntry.image = image;
		return malchusEntry;
	}

	/** @private */
	finishFailed(malchusEntry, error) {
		malchusEntry.status = "failed";
		malchusEntry.error = error instanceof Error
			? error.message
			: String(error || "image-load-failed");
		throw new Error(malchusEntry.error);
	}
}

/** @private */
function createEntry(yesodUrl) {
	return {
		url: yesodUrl,
		status: "loading",
		image: null,
		error: null,
		promise: null
	};
}

/** @private */
function createImageLoader(chochmahOptions) {
	if (typeof chochmahOptions.load === "function") return chochmahOptions.load;
	return async (yesodUrl, netzachPolicy = {}) => {
		const tiferesRecord = await loadRemoteTextureImage(yesodUrl, netzachPolicy);
		if (!tiferesRecord.ok || !tiferesRecord.image) {
			throw new Error(tiferesRecord.error || "remote-texture-load-failed");
		}
		return tiferesRecord.image;
	};
}

/** @private */
function countState(tiferesEntries, yesodState) {
	return tiferesEntries.filter((entry) => entry.status === yesodState).length;
}
