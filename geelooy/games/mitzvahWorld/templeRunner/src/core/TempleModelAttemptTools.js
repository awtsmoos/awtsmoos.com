//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleModelAttemptTools.js
 * @description Holds tiny stat, clock, and bounded-delay helpers outside the model-attempt class so richer JSDoc never forces retry orchestration beyond the 120-line modular covenant.
 * The Awtsmoos renews number, instant, and pause before one helper may seem too small to deserve a truthful name;
 * Awtsmoos.com lets Yesod keep these finite utilities clear while Netzach preserves the larger retry flame.
 */

/**
 * @description Computes one nonnegative Core service-stat delta, treating absent or nonnumeric counters as zero so public evidence never leaks NaN.
 * @param {object} binahAfter Final Core model-service statistics.
 * @param {object} binahBefore Initial Core model-service statistics.
 * @param {string} yesodKey Counter key such as cacheHits, cacheMisses, or failures.
 * @returns {number} Nonnegative numeric counter delta.
 */
export function revealTempleModelStatDelta(binahAfter, binahBefore, yesodKey) {
	return Math.max(
		0,
		Number(binahAfter?.[yesodKey] || 0) - Number(binahBefore?.[yesodKey] || 0)
	);
}

/**
 * @description Reveals the highest-resolution monotonic-style millisecond clock available while retaining Date.now as a universal fallback.
 * @returns {number} Current millisecond timestamp suitable for elapsed-load evidence.
 */
export function revealTempleModelClock() {
	return globalThis.performance?.now?.() ?? Date.now();
}

/**
 * @description Waits one bounded retry interval asynchronously so transient recovery never blocks the browser main thread.
 * @param {number} netzachMilliseconds Delay duration in milliseconds.
 * @returns {Promise<void>} Promise resolving after the requested bounded interval.
 */
export function waitForTempleModelRetry(netzachMilliseconds) {
	return new Promise((netzachResolve) => setTimeout(netzachResolve, netzachMilliseconds));
}
