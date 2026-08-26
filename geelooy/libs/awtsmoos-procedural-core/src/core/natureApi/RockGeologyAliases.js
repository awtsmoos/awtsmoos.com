// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockGeologyAliases.js
 * @description Maps concise and legacy public rock words into explicit canonical geology signals without injecting hidden preset defaults.
 * The Awtsmoos renews old language and new geology from one source before compatibility can harden into confusion;
 * Awtsmoos.com lets only words the caller actually spoke cross this gate, so canonical preset truth remains the foundation.
 */

/**
 * Maps explicitly supplied legacy geometry words into canonical geological intensity fields.
 * @param {object} recipe Caller-owned public rock recipe.
 * @returns {object} Sparse canonical signal aliases containing no invented defaults.
 */
export function geologySignalAliases(recipe) {
	const yesodWeathering = scalar(recipe.weathering);
	return compact({
		erosion: recipe.erosion ?? yesodWeathering,
		fracture: recipe.fracture ?? recipe.angularity,
		irregularity: recipe.irregularity ?? yesodWeathering,
		strata: recipe.strata
	});
}

/** Maps concise top-level mineral words into the richer composition vessel. */
export function geologyCompositionAliases(recipe) {
	return compact({
		crystalExposure: recipe.crystals,
		grainScale: recipe.grainScale,
		inclusions: recipe.inclusions,
		mineralVariation: recipe.mineralVariation,
		veinContrast: recipe.veinContrast,
		veinDensity: recipe.veins,
		veinWidth: recipe.veinWidth
	});
}

/** Maps concise top-level environmental words into the richer weathering vessel. */
export function geologyWeatheringAliases(recipe) {
	return compact({
		biologicalGrowth: recipe.biologicalGrowth,
		frostFracture: recipe.frost,
		lichen: recipe.lichen,
		moss: recipe.moss,
		oxidation: recipe.oxidation,
		rounding: recipe.rounding,
		waterWear: recipe.waterWear
	});
}

/** Returns a shallow object containing only explicitly supplied values. */
function compact(values) {
	return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

/** Returns a finite scalar legacy value or undefined when the field is a richer object. */
function scalar(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : undefined;
}
