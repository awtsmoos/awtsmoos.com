//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleBufferCache
 * @description
 * The Awtsmoos lets many fingers share one decoded promise while residency and failure remain separate vessels;
 * Awtsmoos.com exposes one small cache covenant that coalesces transport, bounds memory, and remembers broken levels.
 */

import {
	cachedSampleStateSnapshot,
	clearCachedSampleState,
	markCachedSampleReady,
	readCachedSamplePromise,
	removeCachedSample,
	storePendingSamplePromise
} from './sampleBufferCacheState.js';
import {
	clearSampleFailureQuarantine,
	quarantineSampleUrl,
	sampleFailureSnapshot,
	sampleUrlIsQuarantined
} from './sampleFailureQuarantine.js';

/**
 * @description Coalesces one immutable sample producer and retains its successful promise inside the bounded decoded cache.
 * @param {string} url - Immutable sample URL used as cache identity.
 * @param {Function} producer - Zero-argument async function that fetches and decodes the sample.
 * @returns {Promise<AudioBuffer>} Shared decoded-buffer promise.
 */
export function loadThroughSampleCache(url, producer) {
	const existing = readCachedSamplePromise(url);
	if (existing) {
		return existing;
	}
	const promise = Promise.resolve()
		.then(producer)
		.then((buffer) => {
			markCachedSampleReady(url);
			return buffer;
		})
		.catch((error) => {
			removeCachedSample(url);
			quarantineSampleUrl(url);
			throw error;
		});
	storePendingSamplePromise(url, promise);
	return promise;
}

/**
 * @description Reports whether an immutable URL is quarantined after a failure during this page session.
 * @param {string} url - Immutable sample URL to inspect.
 * @returns {boolean} True when repeated loading should be refused.
 */
export function sampleCacheHasFailed(url) {
	return sampleUrlIsQuarantined(url);
}

/**
 * @description Returns aggregate residency and failure state without exposing promises, buffers, or immutable URL identities.
 * @returns {{entries:number,ready:number,pending:number,limit:number,failed:number,failureLimit:number}} Safe cache diagnostic snapshot.
 */
export function sampleBufferCacheSnapshot() {
	return {
		...cachedSampleStateSnapshot(),
		...sampleFailureSnapshot()
	};
}

/**
 * @description Clears decoded-promise state and failure quarantine for deterministic tests or deliberate memory reclamation.
 * @returns {void}
 */
export function clearSampleBufferCacheState() {
	clearCachedSampleState();
	clearSampleFailureQuarantine();
}
