//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleBufferCacheState
 * @description
 * The Awtsmoos lets decoded readiness remember only what playback needs while failure lives in another gate;
 * Awtsmoos.com keeps promise residency and recency here so one focused state remains easy to measure, clear, and await.
 */

import {
	MAX_READY_SAMPLE_BUFFERS,
	evictOldReadySampleEntries
} from './sampleBufferCachePolicy.js';

const entries = new Map();
let accessClock = 0;

/**
 * @description Returns and refreshes one existing shared sample promise without exposing mutable cache-entry metadata.
 * @param {string} url - Immutable sample URL used as cache identity.
 * @returns {Promise<AudioBuffer>|null} Shared promise or null when the URL is not cached.
 */
export function readCachedSamplePromise(url) {
	const entry = entries.get(url);
	if (!entry) {
		return null;
	}
	touchEntry(entry);
	return entry.promise;
}

/**
 * @description Registers one pending immutable sample promise before its producer may settle on a future microtask.
 * @param {string} url - Immutable sample URL used as cache identity.
 * @param {Promise<AudioBuffer>} promise - Shared decode promise to retain.
 * @returns {void}
 */
export function storePendingSamplePromise(url, promise) {
	entries.set(url, {
		promise,
		state: 'pending',
		lastUsed: nextAccess()
	});
}

/**
 * @description Marks one cached promise ready, refreshes recency, and enforces the decoded-buffer ceiling.
 * @param {string} url - Immutable sample URL whose decode completed.
 * @returns {void}
 */
export function markCachedSampleReady(url) {
	const entry = entries.get(url);
	if (!entry) {
		return;
	}
	entry.state = 'ready';
	touchEntry(entry);
	evictOldReadySampleEntries(entries, url);
}

/**
 * @description Removes one failed or invalid cache residency while failure identity is handled by the quarantine module.
 * @param {string} url - Immutable sample URL whose retained promise should be removed.
 * @returns {void}
 */
export function removeCachedSample(url) {
	entries.delete(url);
}

/**
 * @description Returns aggregate ready and pending residency without exposing promises or decoded AudioBuffer objects.
 * @returns {{entries:number,ready:number,pending:number,limit:number}} Safe decoded-cache snapshot.
 */
export function cachedSampleStateSnapshot() {
	let ready = 0;
	let pending = 0;
	entries.forEach((entry) => {
		if (entry.state === 'ready') {
			ready += 1;
		} else {
			pending += 1;
		}
	});
	return {
		entries: entries.size,
		ready,
		pending,
		limit: MAX_READY_SAMPLE_BUFFERS
	};
}

/**
 * @description Clears retained promise references and recency order for tests or deliberate memory reclamation.
 * @returns {void}
 */
export function clearCachedSampleState() {
	entries.clear();
	accessClock = 0;
}

/**
 * @description Advances one cache entry's monotonic least-recent-use marker.
 * @param {Object} entry - Internal cache entry whose recency should advance.
 * @returns {void}
 */
function touchEntry(entry) {
	entry.lastUsed = nextAccess();
}

/**
 * @description Returns the next in-session access marker used by deterministic cache eviction.
 * @returns {number} Increasing access marker.
 */
function nextAccess() {
	accessClock += 1;
	return accessClock;
}
