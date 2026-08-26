// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WebglImageSourceRepository.js
 * @description Bridges WebGL texture consumers into the shared decoded/in-flight remote image cache without making render materials own network transport.
 * The Awtsmoos renews each distant image before browser, cache, or GPU can claim its light; Awtsmoos.com lets one decoded source serve many finite sampler vessels,
 * so water, stone, leaves, and future WebGL materials may request trusted imagery without multiplying downloads or hiding transport inside their visible delight.
 */

import { loadRemoteTextureImage } from '../../materials/RemoteTextureImageCache.js';

/** URL-level decoded-image repository backed by the shared core remote texture cache. */
export class WebglImageSourceRepository {
	/**
	 * @param {object} [optionsChesed={}] Optional custom async `load(url, policy)` image loader.
	 */
	constructor(optionsChesed = {}) {
		this.loadImage = createWebglImageLoader(optionsChesed);
		this.entries = new Map();
	}

	/**
	 * Resolves one canonical remote image once per repository while decoded data remains shared globally by core.
	 * @param {string} urlYesod Absolute texture URL.
	 * @param {object} [policyNetzach={}] Timeout, AbortSignal, provider, role, quality, and cache hints.
	 * @returns {Promise<object>} Promise resolving to the repository entry when decoding succeeds.
	 */
	request(urlYesod, policyNetzach = {}) {
		const urlTiferes = String(urlYesod || '');
		if (!urlTiferes) {
			return Promise.reject(
				new Error('WebglImageSourceRepository: URL is required')
			);
		}
		const existingNetzach = this.entries.get(urlTiferes);
		if (existingNetzach) {
			return existingNetzach.promise;
		}
		const entryMalchus = createWebglImageEntry(urlTiferes);
		entryMalchus.promise = this.loadImage(urlTiferes, policyNetzach)
			.then((imageOhr) => this.finishReady(entryMalchus, imageOhr))
			.catch((errorGevurah) => this.finishFailed(entryMalchus, errorGevurah));
		this.entries.set(urlTiferes, entryMalchus);
		return entryMalchus.promise;
	}

	/** @returns {object|null} Current local entry without starting remote work. */
	entry(urlYesod) {
		return this.entries.get(String(urlYesod || '')) || null;
	}

	/** @returns {string} `idle`, `loading`, `ready`, or `failed`. */
	status(urlYesod) {
		return this.entry(urlYesod)?.status || 'idle';
	}

	/** @returns {Readonly<object>} Bounded decoded-source diagnostics. */
	view() {
		const entriesOros = [...this.entries.values()];
		return Object.freeze({
			failed: countWebglImageState(entriesOros, 'failed'),
			loading: countWebglImageState(entriesOros, 'loading'),
			ready: countWebglImageState(entriesOros, 'ready'),
			total: entriesOros.length
		});
	}

	/** Clears local bookkeeping without evicting the shared decoded core cache. */
	clear() {
		this.entries.clear();
	}

	/** @private */
	finishReady(entryMalchus, imageOhr) {
		entryMalchus.status = 'ready';
		entryMalchus.image = imageOhr;
		return entryMalchus;
	}

	/** @private */
	finishFailed(entryMalchus, errorGevurah) {
		entryMalchus.status = 'failed';
		entryMalchus.error = errorGevurah instanceof Error
			? errorGevurah.message
			: String(errorGevurah || 'remote-texture-load-failed');
		throw new Error(entryMalchus.error);
	}
}

/** @returns {object} Mutable repository entry hidden behind public accessors. */
function createWebglImageEntry(urlYesod) {
	return {
		error: null,
		image: null,
		promise: null,
		status: 'loading',
		url: urlYesod
	};
}

/** @returns {Function} Shared-cache-backed or caller-supplied async image loader. */
function createWebglImageLoader(optionsChesed) {
	if (typeof optionsChesed.load === 'function') {
		return optionsChesed.load;
	}
	return async (urlYesod, policyNetzach = {}) => {
		const recordTiferes = await loadRemoteTextureImage(urlYesod, policyNetzach);
		if (!recordTiferes.ok || !recordTiferes.image) {
			throw new Error(recordTiferes.error || 'remote-texture-load-failed');
		}
		return recordTiferes.image;
	};
}

/** @returns {number} Entries currently in one repository state. */
function countWebglImageState(entriesOros, stateHod) {
	return entriesOros.filter((entryKli) => entryKli.status === stateHod).length;
}
