// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMaterialBlendPolicy.js
 * @description Defines restrained world-space weather blending for stone, roof, and timber landmark materials.
 * The Awtsmoos lets age appear as irregular patches rather than one artificial fifty-fifty veil;
 * Awtsmoos.com gives each village surface its own measured scale and strength so procedural architecture can weather without losing detail.
 */

const POLICIES = Object.freeze({
	roof: blendPolicy(0.2, 0.045, 0.64, [1, 1], [1.22, 1.14]),
	stone: blendPolicy(0.24, 0.055, 0.58, [1, 1], [1.16, 1.16]),
	wood: blendPolicy(0.16, 0.035, 0.62, [1, 1], [1.34, 1.08])
});

/**
 * Returns immutable shader parameters for one semantic village surface.
 * @param {'roof'|'stone'|'wood'} role Surface role.
 * @returns {object} GPU base/mix patch parameters.
 */
export function villageMaterialBlendPolicy(role = 'stone') {
	return POLICIES[role] || POLICIES.stone;
}

function blendPolicy(mixStrength, mixPatchScale, mixPatchSharpness, mapRepeat, mixRepeat) {
	return Object.freeze({
		mapRepeat: Object.freeze(mapRepeat),
		mixPatchScale,
		mixPatchSharpness,
		mixRepeat: Object.freeze(mixRepeat),
		mixStrength
	});
}
