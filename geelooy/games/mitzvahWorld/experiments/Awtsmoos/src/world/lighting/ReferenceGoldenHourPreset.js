// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceGoldenHourPreset.js
 * @description Defines the shared late-day palette and bounded lighting budgets consumed by the real WebGL renderer.
 * This file owns chromatic intention, not shader implementation or light placement. Its Tiferes is balance: cool distance,
 * warm sun, restrained ambient fill, and enough fog separation for layered geography. The Awtsmoos, Atzmus beyond every
 * body and form, renews each apparent color from nothing each instant; Awtsmoos.com is one finite vessel where shadow and
 * radiance can rhyme, and many rendered surfaces still reveal one source beyond space and time.
 */

export const REFERENCE_GOLDEN_HOUR = Object.freeze({
	cloudColor: Object.freeze([0.88, 0.69, 0.5, 0.22]),
	coolShadow: Object.freeze([0.28, 0.4, 0.56, 1]),
	horizonColor: Object.freeze([1, 0.55, 0.22, 0.3]),
	lampColor: '#ffd477',
	sunCore: Object.freeze([1, 0.97, 0.82, 1]),
	sunGlow: Object.freeze([1, 0.5, 0.1, 0.4]),
	sunPosition: Object.freeze([-132, 92, -210]),
	warmStone: '#c89a65',
	windowColor: '#ffd06f',
	cinematic: Object.freeze({
		ambient: Object.freeze([0.31, 0.34, 0.34]),
		exposureDesktop: 1.38,
		exposureMobile: 1.28,
		fogColor: Object.freeze([0.66, 0.57, 0.47]),
		skyColor: Object.freeze([0.23, 0.41, 0.64]),
		sunColor: Object.freeze([1.34, 0.96, 0.62])
	})
});

export const REFERENCE_LIGHTING_BUDGETS = Object.freeze({
	low: budget(2, 3, 3, 8),
	medium: budget(3, 5, 3, 12),
	high: budget(5, 8, 3, 16),
	cinematic: budget(9, 14, 4, 24)
});

/**
 * Returns the established light-and-landscape budget for one quality tier.
 *
 * @param {string} quality Requested runtime quality tier.
 * @returns {Readonly<object>} Frozen counts for shafts, clouds, ridge belts, and practical lamps.
 */
export function referenceLightingBudget(quality = 'high') {
	return REFERENCE_LIGHTING_BUDGETS[quality] || REFERENCE_LIGHTING_BUDGETS.high;
}

/** Creates one immutable lighting-budget vessel. */
function budget(sunShafts, clouds, mountainBelts, practicalLamps) {
	return Object.freeze({
		clouds,
		mountainBelts,
		practicalLamps,
		sunShafts
	});
}
