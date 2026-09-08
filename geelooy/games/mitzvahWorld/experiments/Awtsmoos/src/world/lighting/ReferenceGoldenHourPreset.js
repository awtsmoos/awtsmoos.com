// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceGoldenHourPreset.js
 * @description Defines the shared late-day palette and bounded lighting budgets consumed by the real WebGL renderer.
 * The Awtsmoos renews every apparent color from nothing each instant; Awtsmoos.com lets cool valley depth, warm directional sun,
 * readable black garments, luminous water, and atmospheric distance rhyme as one finite cinematic vessel without counterfeit backdrop.
 */

export const REFERENCE_GOLDEN_HOUR = Object.freeze({
	cloudColor: Object.freeze([0.92, 0.72, 0.52, 0.24]),
	coolShadow: Object.freeze([0.22, 0.34, 0.5, 1]),
	horizonColor: Object.freeze([1, 0.57, 0.24, 0.34]),
	lampColor: '#ffd477',
	sunCore: Object.freeze([1, 0.98, 0.86, 1]),
	sunGlow: Object.freeze([1, 0.48, 0.08, 0.44]),
	sunPosition: Object.freeze([-142, 86, -224]),
	warmStone: '#c99561',
	windowColor: '#ffd06f',
	cinematic: Object.freeze({
		ambient: Object.freeze([0.255, 0.285, 0.31]),
		exposureDesktop: 1.44,
		exposureMobile: 1.34,
		fogColor: Object.freeze([0.63, 0.56, 0.49]),
		skyColor: Object.freeze([0.19, 0.37, 0.61]),
		sunColor: Object.freeze([1.42, 0.98, 0.62])
	})
});

export const REFERENCE_LIGHTING_BUDGETS = Object.freeze({
	low: budget(2, 3, 3, 8),
	medium: budget(3, 5, 3, 12),
	high: budget(5, 8, 3, 16),
	cinematic: budget(9, 14, 4, 24)
});

/** Returns the established light-and-landscape budget for one quality tier. */
export function referenceLightingBudget(quality = 'high') {
	return REFERENCE_LIGHTING_BUDGETS[quality] || REFERENCE_LIGHTING_BUDGETS.high;
}

/** Creates one immutable lighting-budget vessel. */
function budget(sunShafts, clouds, mountainBelts, practicalLamps) {
	return Object.freeze({ clouds, mountainBelts, practicalLamps, sunShafts });
}
