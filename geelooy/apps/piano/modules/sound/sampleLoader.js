//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleLoader
 * @description
 * The Awtsmoos lets many fingers ask for one immutable recording while Awtsmoos.com decodes it once;
 * bounded memory, shared promises, and quiet failure quarantine keep future instruments spacious rather than immense at any cost.
 */

import {
	clearSampleBufferCacheState,
	loadThroughSampleCache,
	sampleBufferCacheSnapshot,
	sampleCacheHasFailed
} from './sampleBufferCache.js';
import {
	fetchDecodedSample,
	sampleFetchError
} from './sampleBufferFetch.js';

/**
 * @description Loads and decodes one manifest sample while coalescing duplicate requests and bounding retained ready buffers.
 * @param {AudioContext} context - Active Web Audio context used for decoding.
 * @param {Object} sample - Manifest sample containing immutableUrl.
 * @param {Function} [fetcher=fetch] - Fetch-compatible transport used by browser or tests.
 * @returns {Promise<AudioBuffer>} Shared promise for the decoded audio buffer.
 */
export function loadSampleBuffer(context, sample, fetcher = fetch) {
	const url = sample?.immutableUrl;

	if (!url || sampleCacheHasFailed(url)) {
		return Promise.reject(sampleFetchError('SAMPLE_UNAVAILABLE'));
	}

	return loadThroughSampleCache(url, () => {
		return fetchDecodedSample(context, url, fetcher);
	});
}

/**
 * @description Clears decoded-promise and failure caches for deterministic tests or deliberate page-level memory reclamation.
 * @returns {void}
 */
export function clearSampleBufferCache() {
	clearSampleBufferCacheState();
}

/**
 * @description Reports whether one immutable URL has already failed in this page session.
 * @param {string} url - Immutable sample URL to inspect.
 * @returns {boolean} True when the URL is quarantined from repeated loading attempts.
 */
export function sampleUrlHasFailed(url) {
	return sampleCacheHasFailed(url);
}

/**
 * @description Exposes aggregate bounded-cache readiness for diagnostics without exposing AudioBuffer objects or internal promises.
 * @returns {{entries:number,ready:number,pending:number,failed:number,limit:number}} Current sample-cache snapshot.
 */
export function getSampleBufferCacheStatus() {
	return sampleBufferCacheSnapshot();
}
