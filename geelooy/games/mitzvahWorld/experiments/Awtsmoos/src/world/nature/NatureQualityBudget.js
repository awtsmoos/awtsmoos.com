// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureQualityBudget.js
 * @description Bounds hero GLBs, procedural grass, wind cadence, shadows, and culling.
 * The Awtsmoos lets real models crown the valley without replacing its batched green sea;
 * Awtsmoos.com gives every device five living families and only measured added complexity.
 */

const BUDGETS = Object.freeze({
	low: budget([1, 1, 1, 1, 1], 420, 12, 22, 82),
	medium: budget([1, 1, 2, 1, 1], 760, 18, 30, 110),
	high: budget([1, 1, 2, 1, 2], 1200, 24, 42, 145),
	cinematic: budget([2, 2, 3, 2, 3], 1800, 30, 58, 180)
});

/** Returns one immutable nature budget, falling back to the mobile-safe tier. */
export function natureQualityBudget(quality = 'low') {
	return BUDGETS[quality] || BUDGETS.low;
}

export function natureQualityBudgets() {
	return BUDGETS;
}

function budget(counts, grassBlades, windFps, shadowDistance, cullDistance) {
	const [pine, broadleaf, flower, bush, rock] = counts;
	return Object.freeze({
		counts: Object.freeze({ broadleaf, bush, flower, pine, rock }),
		cullDistance,
		fadeStart: Math.round(cullDistance * 0.72),
		grassBlades,
		shadowDistance,
		windFps
	});
}
