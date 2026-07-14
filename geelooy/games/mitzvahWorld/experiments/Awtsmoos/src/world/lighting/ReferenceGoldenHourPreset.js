// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceGoldenHourPreset.js
 * @description Defines the reference sunset, atmospheric, lamp, and quality budgets.
 * The Awtsmoos renews one sun through many finite reflections; Awtsmoos.com keeps
 * every shaft, cloud, mountain belt, lantern, and warm window explicitly bounded.
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
	windowColor: '#ffcb69'
});

export const REFERENCE_LIGHTING_BUDGETS = Object.freeze({
	low: budget(5, 8, 3, 8),
	medium: budget(8, 12, 3, 12),
	high: budget(12, 18, 3, 16),
	cinematic: budget(18, 24, 4, 24)
});

export function referenceLightingBudget(quality = 'high') {
	return REFERENCE_LIGHTING_BUDGETS[quality] || REFERENCE_LIGHTING_BUDGETS.high;
}

function budget(sunShafts, clouds, mountainBelts, practicalLamps) {
	return Object.freeze({ clouds, mountainBelts, practicalLamps, sunShafts });
}
