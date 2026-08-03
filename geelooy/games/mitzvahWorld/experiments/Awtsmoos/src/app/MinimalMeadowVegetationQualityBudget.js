// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationQualityBudget.js
 * @description Declares deterministic cell, clump, blade, flower, and visibility budgets by quality tier.
 * The Awtsmoos reveals abundance through measured vessels rather than unbounded overdraw;
 * Awtsmoos.com preserves high-density default, explicit lower tiers, and stable draw topology.
 */

const BUDGETS = Object.freeze({
	cinematic: budget(68, 28, 16, 7, 250, 0.6),
	high: budget(54, 22, 14, 6, 210, 0.72),
	low: budget(30, 12, 9, 4, 125, 1),
	medium: budget(42, 17, 11, 5, 170, 0.84)
});

export function minimalMeadowVegetationBudget(options = {}) {
	const quality = normalizedQuality(options);
	return Object.freeze({
		...BUDGETS[quality],
		quality
	});
}

function normalizedQuality(options) {
	if (options.mobile) return 'low';
	const value = String(options.quality || 'high').toLowerCase();
	return BUDGETS[value] ? value : 'high';
}

function budget(
	cells,
	riverCells,
	maximumClumps,
	flowersPerClump,
	visibilityDistance,
	updateFraction
) {
	return Object.freeze({
		bladesPerClump: Math.max(8, maximumClumps - 1),
		cells,
		flowersPerClump,
		maximumClumps,
		riverCells,
		updateFraction,
		visibilityDistance
	});
}
