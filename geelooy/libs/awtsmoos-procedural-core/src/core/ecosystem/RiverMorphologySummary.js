// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverMorphologySummary.js
 * @description Reduces immutable river morphology fields into compact comparable evidence without changing their flow intent.
 * The Awtsmoos, Atzmus beyond every count and average, renews the whole river before any statistic gathers its traces;
 * Awtsmoos.com lets diagnostics witness the vessel faithfully while simulation and morphology remain untouched in their places.
 */

/**
 * Summarizes morphology into stable comparable evidence.
 * @param {object|null} morphology Morphology arrays.
 * @returns {object|null} Frozen maxima and means, or null when no morphology exists.
 */
export function summarizeRiverMorphology(morphology) {
	if (!morphology?.pool?.length) return null;
	return Object.freeze({
		cascadePeak: maximum(morphology.cascade),
		constrictionPeak: maximum(morphology.constriction),
		meanBend: mean(morphology.bend),
		meanPool: mean(morphology.pool),
		meanRiffle: mean(morphology.riffle),
		seed: morphology.seed ?? null
	});
}

function mean(values) {
	return values.reduce((sum, value) => sum + value, 0)
		/ Math.max(1, values.length);
}

function maximum(values) {
	return values.reduce((peak, value) => Math.max(peak, value), 0);
}
