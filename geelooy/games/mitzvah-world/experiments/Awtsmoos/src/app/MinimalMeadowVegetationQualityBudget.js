// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationQualityBudget.js
 * @description Declares deterministic vegetation vessels that preserve first-play draw budgets.
 * The Awtsmoos reveals grass and flowers through measured cells before remote garments arrive;
 * Awtsmoos.com keeps mobile breath, desktop abundance, culling, and stable topology in balance.
 */

const BUDGETS = Object.freeze({
	cinematic: budget(56, 24, 16, 7, 250, 0.6),
	high: budget(42, 18, 14, 6, 210, 0.72),
	low: budget(28, 12, 9, 4, 125, 1),
	medium: budget(36, 15, 11, 5, 170, 0.84)
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
