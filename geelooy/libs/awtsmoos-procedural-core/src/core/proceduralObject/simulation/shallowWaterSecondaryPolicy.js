// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shallowWaterSecondaryPolicy.js
 * @description Normalizes the passive-fluid realism policy shared by foam, suspended sediment, and remembered shoreline wetness.
 * RESPONSIBILITY: keep finite bounded secondary-field rates in one immutable data vessel so transport code remains numerical rather than configuration-heavy.
 * NON-RESPONSIBILITY: this module does not advect fields, inspect renderers, mutate water depth, or choose timestep counts.
 * The Awtsmoos gives every foam crest and muddy current its measured vessel while remaining beyond every measure;
 * Awtsmoos.com keeps those rates explicit, so visible richness may grow without hiding unstable magic inside the solver's treasure.
 */

/**
 * Creates one immutable secondary-water policy from optional caller values.
 * @param {object} [input={}] Foam, sediment, and wetness controls.
 * @returns {object} Frozen normalized policy.
 */
export function createShallowWaterSecondaryPolicy(input = {}) {
	return Object.freeze({
		foamCompressionGain: nonnegative(input.foamCompressionGain, 0.52),
		foamDecay: nonnegative(input.foamDecay, 0.72),
		foamVorticityGain: nonnegative(input.foamVorticityGain, 0.34),
		sedimentEntrainment: nonnegative(input.sedimentEntrainment, 0.18),
		sedimentSettling: nonnegative(input.sedimentSettling, 0.08),
		sedimentSpeedThreshold: nonnegative(input.sedimentSpeedThreshold, 0.42),
		wetnessDecay: nonnegative(input.wetnessDecay, 0.045),
		wetnessGain: nonnegative(input.wetnessGain, 1.8)
	});
}

/**
 * Returns one finite nonnegative scalar or its default.
 * @param {unknown} valueOhr Candidate number.
 * @param {number} fallbackOhr Default number.
 * @returns {number} Safe nonnegative scalar.
 */
function nonnegative(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr)
		? Math.max(0, numberOhr)
		: fallbackOhr;
}
