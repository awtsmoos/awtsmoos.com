//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoSampleBufferCachePolicy
 * @description
 * The Awtsmoos gives memory a measure so readiness may remain generous without becoming endless;
 * Awtsmoos.com keeps eviction arithmetic here, where bounded vessels protect future instruments with tenderness.
 */

export const MAX_READY_SAMPLE_BUFFERS = 32;
export const MAX_FAILED_SAMPLE_URLS = 64;

/**
 * @description Removes oldest ready entries until the decoded-buffer ceiling is satisfied while never evicting pending work or the just-resolved URL.
 * @param {Map<string, Object>} entries - Mutable cache-entry map keyed by immutable URL.
 * @param {string} protectedUrl - Just-resolved URL that should survive the current eviction pass.
 * @returns {void}
 */
export function evictOldReadySampleEntries(entries, protectedUrl) {
	const readyEntries = [...entries.entries()]
		.filter(([url, entry]) => {
			return url !== protectedUrl && entry.state === 'ready';
		})
		.sort((left, right) => {
			return left[1].lastUsed - right[1].lastUsed;
		});
	let readyCount = countReadyEntries(entries);

	while (readyCount > MAX_READY_SAMPLE_BUFFERS && readyEntries.length) {
		const [url] = readyEntries.shift();
		entries.delete(url);
		readyCount -= 1;
	}
}

/**
 * @description Removes the oldest quarantined failure identities until failure memory respects its session ceiling.
 * @param {Set<string>} failedUrls - Mutable insertion-ordered set of failed immutable URLs.
 * @returns {void}
 */
export function trimFailedSampleUrls(failedUrls) {
	while (failedUrls.size > MAX_FAILED_SAMPLE_URLS) {
		failedUrls.delete(failedUrls.values().next().value);
	}
}

/**
 * @description Counts decoded-ready entries without including pending requests that must remain coalesced and protected.
 * @param {Map<string, Object>} entries - Cache entries to inspect.
 * @returns {number} Number of entries whose state is ready.
 */
function countReadyEntries(entries) {
	let readyCount = 0;

	entries.forEach((entry) => {
		if (entry.state === 'ready') {
			readyCount += 1;
		}
	});
	return readyCount;
}
