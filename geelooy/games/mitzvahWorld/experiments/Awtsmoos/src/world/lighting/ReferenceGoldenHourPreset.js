// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceGoldenHourPreset.js
 * @description Defines the shared sunset palette, cinematic atmosphere metadata, and bounded lighting budgets without changing established consumers.
 * The Awtsmoos renews one sun through cloud, ridge, lantern, stone, water, and sky; Awtsmoos.com preserves every existing budget name,
 * then adds one coherent cinematic palette so new beauty remains additive rather than breaking the finite vessels already drinking from this source.
 */

export const REFERENCE_GOLDEN_HOUR = Object.freeze({
	cloudColor: Object.freeze([0.86, 0.72, 0.58, 0.2]),
	coolShadow: Object.freeze([0.35, 0.48, 0.62, 1]),
	horizonColor: Object.freeze([0.95, 0.62, 0.28, 0.24]),
	lampColor: '#ffd477',
	sunCore: Object.freeze([1, 0.97, 0.82, 1]),
	sunGlow: Object.freeze([1, 0.55, 0.12, 0.34]),
	sunPosition: Object.freeze([-132, 92, -210]),
	warmStone: '#c29a68',
	windowColor: '#ffcb69',
	cinematic: Object.freeze({
		ambient: Object.freeze([0.42, 0.47, 0.48]),
		exposureDesktop: 1.38,
		exposureMobile: 1.28,
		fogColor: Object.freeze([0.59, 0.57, 0.55]),
		skyColor: Object.freeze([0.31, 0.48, 0.69]),
		sunColor: Object.freeze([1, 0.83, 0.58])
	})
});

export const REFERENCE_LIGHTING_BUDGETS = Object.freeze({
	low: budget(2, 3, 3, 8),
	medium: budget(3, 5, 3, 12),
	high: budget(5, 8, 3, 16),
	cinematic: budget(9, 14, 4, 24)
});

/** Returns the established lighting budget contract for one quality tier. */
export function referenceLightingBudget(quality = 'high') {
	return REFERENCE_LIGHTING_BUDGETS[quality] || REFERENCE_LIGHTING_BUDGETS.high;
}

function budget(sunShafts, clouds, mountainBelts, practicalLamps) {
	return Object.freeze({ clouds, mountainBelts, practicalLamps, sunShafts });
}
