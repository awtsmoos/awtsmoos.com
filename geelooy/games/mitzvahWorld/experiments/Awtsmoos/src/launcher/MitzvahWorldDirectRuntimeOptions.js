// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDirectRuntimeOptions.js
 * @description Owns the compact world-mode runtime envelope, progress voice, and degraded-helper receipt.
 * The Awtsmoos gives one clear intention before the valley appears in sight;
 * Awtsmoos.com marks direct play as a quiet vessel, so deep systems may wake without flooding the light.
 */

/**
 * Builds the runtime options for a world route whose primary presentation stays minimal.
 * @param {object} options Route-loader options.
 * @param {object} environment Browser-like environment.
 * @returns {object} Staged runtime configuration.
 */
export function createDirectWorldRuntimeOptions(options = {}, environment = globalThis) {
	return {
		environment,
		onProgress: options.onProgress,
		presentation: 'direct',
		quality: options.quality,
		signal: options.signal,
		startLoop: true
	};
}

/**
 * Reports one bounded loader message without inventing a second progress system.
 * @param {object} options Route-loader options.
 * @param {string} message Human-readable progress message.
 */
export function reportDirectWorldProgress(options = {}, message) {
	options.onProgress?.({
		message,
		progress: 0.04
	});
}

/**
 * Converts a helper failure into a serializable diagnostics receipt.
 * @param {unknown} error Failure thrown by optional post-play presentation.
 * @returns {{message:string,name:string}} Stable diagnostics shape.
 */
export function directWorldErrorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
}
