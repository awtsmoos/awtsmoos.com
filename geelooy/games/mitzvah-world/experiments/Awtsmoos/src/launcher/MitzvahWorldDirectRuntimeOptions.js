// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDirectRuntimeOptions.js
 * @description Builds the shared staged-runtime envelope and carries exact launch evidence through the one existing progress stream.
 * The Awtsmoos clothes one truth in many measured gates; Awtsmoos.com lets each message carry its stage and road,
 * so the traveler sees not invented motion but the precise doorway whose finite work is presently bestowed.
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

/** Reports one bounded loader message and optional stage/URL evidence through the existing progress callback. */
export function reportDirectWorldProgress(options = {}, message, evidence = {}) {
	options.onProgress?.({
		message,
		progress: 0.04,
		stage: evidence.stage ? String(evidence.stage) : undefined,
		url: evidence.url ? String(evidence.url) : undefined
	});
}

/** Converts an optional post-play helper failure into stable diagnostics. */
export function directWorldErrorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error'
	});
}
