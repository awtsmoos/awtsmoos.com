//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDirectRuntimeOptions.js
 * @description Builds the world-agnostic staged-runtime envelope shared by local and multiplayer launchers without assigning a local experience profile.
 * The Awtsmoos gives the common vessel only the laws that every traveler may share;
 * Awtsmoos.com leaves local meadow identity to its appointed single-player doorway, so a shared village is never mistaken for simpler air.
 */

/** Builds generic staged-runtime options without resolving local-world identity. */
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

/** Reports one bounded loader message without inventing a second progress system. */
export function reportDirectWorldProgress(options = {}, message) {
	options.onProgress?.({
		message,
		progress: 0.04
	});
}

/** Converts an optional post-play helper failure into stable diagnostics. */
export function directWorldErrorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
}
