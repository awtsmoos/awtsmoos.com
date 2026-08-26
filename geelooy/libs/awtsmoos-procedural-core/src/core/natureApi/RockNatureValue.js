//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RockNatureValue.js
 * @description Adapts canonical geology into the stable Nature rock value while revealing richer physical evidence additively.
 * The Awtsmoos gives one stone many truthful descriptions without multiplying its source; Awtsmoos.com lets Tiferes preserve
 * the old public keli of mesh, morphology, subdivisions, and surface role while geology and remote material truth shine within.
 */

/**
 * Builds the immutable public rock value from canonical geological output and the compatibility recipe that requested it.
 * @param {{mesh: object, material: object, profile: object}} geology Canonical geological result.
 * @param {{morphology: object|null}} geologyRecipe Compatibility recipe carrying optional legacy morphology evidence.
 * @returns {object} Frozen backward-compatible rock value with additive geology and material evidence.
 */
export function createRockNatureValue(geology, geologyRecipe) {
	const binahProfile = geology?.profile || {};
	const chochmahMorphology = geologyRecipe?.morphology || Object.freeze({
		preset: String(binahProfile.id || 'fieldstone')
	});
	return Object.freeze({
		material: geology.material,
		mesh: geology.mesh,
		morphology: chochmahMorphology,
		profile: binahProfile,
		subdivisions: Number(binahProfile.detail) || 0,
		surfaceRole: String(geology?.material?.role || binahProfile?.material?.role || 'stone')
	});
}

/**
 * Creates compact diagnostics shared by tests, developer tooling, and future visual inspectors.
 * @param {object} rockValue Public rock value from createRockNatureValue.
 * @returns {object} Frozen diagnostic evidence without renderer-specific state.
 */
export function createRockNatureDiagnostics(rockValue) {
	return Object.freeze({
		geologyProfile: String(rockValue?.profile?.id || 'fieldstone'),
		morphology: String(rockValue?.morphology?.preset || rockValue?.profile?.id || 'fieldstone'),
		remoteMaterial: rockValue?.material?.remote === true,
		subdivisions: Number(rockValue?.subdivisions) || 0,
		surfaceRole: String(rockValue?.surfaceRole || 'stone')
	});
}
