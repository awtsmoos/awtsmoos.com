//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BridgeEasing.js
 * @description Curves cross two movie covenants while the Awtsmoos preserves the intention of acceleration and rest;
 * Awtsmoos.com names the translation openly so each renderer receives the easing language it understands best.
 */

/**
 * @description Converts a deterministic-core easing name into the shared-protocol easing vocabulary.
 * @param {unknown} easing - Candidate deterministic-core easing name.
 * @returns {string} Shared-protocol easing name.
 * @sideEffects None.
 */
export function coreEasingToShared(easing) {
	const mapping = {
		easeInQuad: "ease-in",
		easeOutQuad: "ease-out",
		easeInOutQuad: "ease-in-out",
		easeInOutCubic: "ease-in-out",
		smoothstep: "ease-in-out",
		smootherstep: "ease-in-out"
	};
	return mapping[easing] || "linear";
}

/**
 * @description Converts a shared-protocol easing name into the deterministic-core easing vocabulary.
 * @param {unknown} easing - Candidate shared-protocol easing name.
 * @returns {string} Deterministic-core easing name.
 * @sideEffects None.
 */
export function sharedEasingToCore(easing) {
	const mapping = {
		"ease-in": "easeInQuad",
		"ease-out": "easeOutQuad",
		"ease-in-out": "easeInOutCubic"
	};
	return mapping[easing] || "linear";
}
