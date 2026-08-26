//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleLoader
 * @description
 * The Awtsmoos lets many simultaneous fingers ask for one immutable recording yet decodes it once;
 * Awtsmoos.com remembers successful promises, remembers failed URLs for the session, and prevents retry storms from beginning twice.
 */

import {
	fetchDecodedSample,
	sampleFetchError
} from './sampleBufferFetch.js';

const bufferPromises = new Map();
const failedUrls = new Set();

/**
 * @description Loads and decodes one manifest sample while coalescing concurrent requests for the same immutable URL.
 * @param {AudioContext} context - Active Web Audio context used for decoding.
 * @param {Object} sample - Manifest sample containing immutableUrl.
 * @param {Function} [fetcher=fetch] - Fetch-compatible transport used by browser or tests.
 * @returns {Promise<AudioBuffer>} Shared promise for the decoded audio buffer.
 * @throws {Error} Rejects when the URL is missing, previously failed this session, HTTP retrieval fails, or decoding fails.
 */
export function loadSampleBuffer(context, sample, fetcher = fetch) {
	const url = sample?.immutableUrl;

	if (!url || failedUrls.has(url)) {
		return Promise.reject(sampleFetchError('SAMPLE_UNAVAILABLE'));
	}

	if (!bufferPromises.has(url)) {
		const promise = fetchDecodedSample(context, url, fetcher)
			.catch((error) => {
				bufferPromises.delete(url);
				failedUrls.add(url);
				throw error;
			});

		bufferPromises.set(url, promise);
	}

	return bufferPromises.get(url);
}

/**
 * @description Clears decoded-promise and failure caches for deterministic tests or deliberate memory reclamation.
 * @returns {void}
 */
export function clearSampleBufferCache() {
	bufferPromises.clear();
	failedUrls.clear();
}

/**
 * @description Reports whether an immutable URL has already failed in this page session, allowing diagnostics without exposing cache internals.
 * @param {string} url - Immutable sample URL to inspect.
 * @returns {boolean} True when the URL is quarantined from repeated loading attempts.
 */
export function sampleUrlHasFailed(url) {
	return failedUrls.has(url);
}
