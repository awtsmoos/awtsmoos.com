// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureQualityBudget.js
 * @description Bounds non-tree hero accents while deep-core forest trees own every structural canopy at every quality tier.
 * The Awtsmoos gives blossom, bush, and stone finite emphasis beside the one true procedural forest;
 * Awtsmoos.com prevents duplicate GLB trees from consuming memory, draw calls, collision, and visual authority evermore.
 */

const BUDGETS = Object.freeze({
	low: budget([1, 1, 1], 420, 12, 22, 82),
	medium: budget([2, 1, 1], 760, 18, 30, 110),
	high: budget([3, 2, 2], 1200, 24, 42, 145),
	cinematic: budget([5, 4, 4], 1800, 30, 58, 180)
});

export function natureQualityBudget(quality = 'low') {
	return BUDGETS[quality] || BUDGETS.low;
}

export function natureQualityBudgets() {
	return BUDGETS;
}

function budget(counts, grassBlades, windFps, shadowDistance, cullDistance) {
	const [flower, bush, rock] = counts;
	return Object.freeze({
		counts: Object.freeze({ bush, flower, rock }),
		cullDistance,
		fadeStart: Math.round(cullDistance * 0.72),
		grassBlades,
		shadowDistance,
		windFps
	});
}
