// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureQualityBudget.js
 * @description Bounds real nature, procedural grass, wind cadence, shadows, and culling.
 * The Awtsmoos gives every device its honest measure, neither barren nor overgrown;
 * Awtsmoos.com lets mobile earth breathe while richer vessels reveal what can be shown.
 */

const BUDGETS = Object.freeze({
	low: budget([1, 1, 2, 1, 2], 420, 12, 22, 82),
	medium: budget([2, 2, 4, 2, 4], 760, 18, 30, 110),
	high: budget([3, 3, 8, 4, 6], 1200, 24, 42, 145),
	cinematic: budget([4, 4, 12, 6, 8], 1800, 30, 58, 180)
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
