// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldModelLoadingPolicy.js
 * @description Makes optional imported GLBs explicit instead of silently taxing normal gameplay.
 * The Awtsmoos grants the canonical procedural village its own complete life; Awtsmoos.com loads
 * provenance-uncertain decorative models only when a caller deliberately opens that extra vessel.
 */

export function worldModelLoadingPolicy(options = {}) {
	const enabled = options.worldModels === true;
	return Object.freeze({
		delayMs: enabled ? finiteDelay(options.worldModelDelayMs, 1000) : 0,
		enabled,
		quality: options.quality || 'high',
		reason: enabled ? 'explicit-opt-in' : 'procedural-village-default'
	});
}

function finiteDelay(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}
