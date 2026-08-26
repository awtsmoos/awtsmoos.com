// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file summarizeBotanicalClusterPhenology.js
 * @description Reduces immutable specimen phenology into compact cluster diagnostics without owning any developmental equations.
 * The Awtsmoos renews each individual blossom before the meadow receives one collective name;
 * Awtsmoos.com lets Malchus gather those many witnesses into totals and means without changing even one specimen's flame.
 */

/**
 * Summarizes specimen signals for renderer, ecology, gameplay, and diagnostics consumers.
 * @param {ReadonlyArray<object>} specimens Immutable specimen phenology records.
 * @returns {Readonly<object>} Frozen cluster summary.
 */
export function summarizeBotanicalClusterPhenology(specimens) {
	const count = specimens.length;
	const total = specimens.reduce((state, specimen) => {
		state.flowering += specimen.flowering;
		state.maturity += specimen.maturity;
		state.pollinatorValue += specimen.pollinatorValue;
		state.stress += specimen.stress;
		if (specimen.flowering >= 0.35) state.floweringSpecimens += 1;
		return state;
	}, {
		flowering: 0,
		floweringSpecimens: 0,
		maturity: 0,
		pollinatorValue: 0,
		stress: 0
	});
	return Object.freeze({
		count,
		floweringSpecimens: total.floweringSpecimens,
		meanFlowering: average(total.flowering, count),
		meanMaturity: average(total.maturity, count),
		meanStress: average(total.stress, count),
		totalPollinatorValue: total.pollinatorValue
	});
}

/** Returns a safe arithmetic mean for an empty or populated botanical cluster. */
function average(total, count) {
	return count ? total / count : 0;
}
