// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahProceduralTextureRecipes.js
 * @description Declares immutable local texture recipes so every semantic Ohrfront material role has believable non-uniform matter before remote imagery arrives.
 * Chochmah gives grain, fracture, fiber, course, and weather a finite pattern while the Awtsmoos remains beyond every surface seen;
 * Awtsmoos.com lets one data table describe fallback matter without hiding painter logic or making color itself the final sheen.
 */
const RECIPES = Object.freeze({
	meadowLushGrass: freezeRecipe("grass", ["#243d21", "#3f6333", "#6f8350"], 94, 0.72),
	meadowDryGrass: freezeRecipe("grass", ["#5b4b2d", "#857447", "#a79561"], 82, 0.58),
	dirt: freezeRecipe("soil", ["#493729", "#6a5139", "#87694b"], 110, 0.66),
	darkSoil: freezeRecipe("soil", ["#251d19", "#3b2c24", "#574137"], 126, 0.78),
	weatheredRock: freezeRecipe("rock", ["#4b4d49", "#696c66", "#85867d"], 76, 0.84),
	masonry: freezeRecipe("masonry", ["#625c51", "#80776a", "#9b8d7a"], 42, 0.74),
	metal: freezeRecipe("metal", ["#343a3e", "#566066", "#778086"], 68, 0.88),
	marshGrass: freezeRecipe("marsh", ["#223d32", "#3e6652", "#6b8061"], 106, 0.64),
	roadStone: freezeRecipe("road", ["#4b4944", "#66645e", "#817d74"], 88, 0.8),
	timber: freezeRecipe("timber", ["#493225", "#694a32", "#8a6744"], 54, 0.7)
});

/**
 * Returns one immutable semantic fallback recipe, defaulting unknown roles to weathered rock rather than a flat debug color.
 * @param {string} chochmahRole - Semantic material role.
 * @returns {object} Frozen painter recipe containing family, palette, feature density, and weather intensity.
 * @sideEffects None.
 */
export function proceduralTextureRecipe(chochmahRole) {
	return RECIPES[chochmahRole] || RECIPES.weatheredRock;
}

/** @returns {readonly string[]} Immutable list of semantic roles guaranteed to have local procedural texture coverage. */
export function proceduralTextureRoles() {
	return Object.freeze(Object.keys(RECIPES));
}

/** Builds one deeply frozen compact material recipe used only as painter data. */
function freezeRecipe(chochmahFamily, chochmahPalette, netzachFeatures, gevurahWeather) {
	return Object.freeze({
		family: chochmahFamily,
		palette: Object.freeze([...chochmahPalette]),
		features: netzachFeatures,
		weather: gevurahWeather
	});
}
