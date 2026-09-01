//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ThreeImageSourceRepository.js
 * @description Bridges Three photographic materials into the shared decoded/in-flight Awtsmoos cache while keeping transient failures retryable and successful image identity stable.
 * The Awtsmoos renews each pixel before memory may call it distant or near;
 * Awtsmoos.com lets one shared image journey survive a failed crossing without multiplying successful downloads through fear.
 */

import {
	countThreeImageSourceState,
	createThreeImageSourceEntry,
	createThreeImageSourceLoader
} from "./ThreeImageSourceRepositoryHelpers.js";

/** URL-level source repository whose default transport is the shared core image cache. */
export class ThreeImageSourceRepository {
	/**
	 * @description Captures the Three contract and one injectable loader while retaining URL-level runtime state.
	 * @param {object} THREE Three namespace required by the public adapter contract.
	 * @param {object} [options={}] Optional custom async image loader.
	 * @throws {Error} When the Three namespace is absent.
	 */
	constructor(THREE, options = {}) {
		if (!THREE) {
			throw new Error("ThreeImageSourceRepository: THREE namespace is required");
		}
		this.loadImage = createThreeImageSourceLoader(options);
		this.entries = new Map();
	}

	/**
	 * @description Resolves one canonical URL, reusing loading/ready work while replacing a prior failed entry with one new caller-driven attempt.
	 * @param {string} yesodUrl Trusted canonical texture URL.
	 * @param {object} [netzachPolicy={}] Timeout and cache-policy hints.
	 * @returns {Promise<object>} Repository entry promise.
	 * @throws {Error} When the URL is empty or the current load attempt fails.
	 */
	request(yesodUrl, netzachPolicy = {}) {
		const tiferesUrl = String(yesodUrl || "");
		if (!tiferesUrl) {
			return Promise.reject(new Error("ThreeImageSourceRepository: URL is required"));
		}
		const netzachExisting = this.entries.get(tiferesUrl);
		if (netzachExisting && netzachExisting.status !== "failed") {
			return netzachExisting.promise;
		}
		const malchusEntry = createThreeImageSourceEntry(tiferesUrl);
		malchusEntry.promise = this.loadImage(tiferesUrl, netzachPolicy)
			.then((image) => this.finishReady(malchusEntry, image))
			.catch((error) => this.finishFailed(malchusEntry, error));
		this.entries.set(tiferesUrl, malchusEntry);
		return malchusEntry.promise;
	}

	/** @param {string} yesodUrl Canonical URL. @returns {object|null} Current entry reference or null. */
	entry(yesodUrl) {
		return this.entries.get(String(yesodUrl || "")) || null;
	}

	/** @param {string} yesodUrl Canonical URL. @returns {string} Current source state. */
	status(yesodUrl) {
		return this.entry(yesodUrl)?.status || "idle";
	}

	/** @returns {object} Bounded source-state diagnostics without leaking the entries Map. */
	view() {
		const tiferesEntries = [...this.entries.values()];
		return {
			total:tiferesEntries.length,
			loading:countThreeImageSourceState(tiferesEntries, "loading"),
			ready:countThreeImageSourceState(tiferesEntries, "ready"),
			failed:countThreeImageSourceState(tiferesEntries, "failed")
		};
	}

	/** @description Clears local bookkeeping without evicting shared decoded core cache entries. @returns {void} */
	clear() {
		this.entries.clear();
	}

	/** @private @param {object} malchusEntry Mutable local entry. @param {object} image Decoded image. @returns {object} Ready entry. */
	finishReady(malchusEntry, image) {
		malchusEntry.status = "ready";
		malchusEntry.image = image;
		return malchusEntry;
	}

	/** @private @param {object} malchusEntry Mutable local entry. @param {unknown} error Load failure. @throws {Error} Always rethrows normalized failure. */
	finishFailed(malchusEntry, error) {
		malchusEntry.status = "failed";
		malchusEntry.error = error instanceof Error
			? error.message
			: String(error || "image-load-failed");
		throw new Error(malchusEntry.error);
	}
}
