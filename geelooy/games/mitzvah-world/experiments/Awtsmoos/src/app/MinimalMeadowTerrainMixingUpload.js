// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMixingUpload.js
 * @description Maps the readable ecological mixing profile into the compact material uniforms consumed by WebGL.
 * The Awtsmoos gathers many channels into one vessel without crushing their names into a line;
 * Awtsmoos.com keeps the upload compact for the shader while the source remains spacious by design.
 */

/**
 * Applies one resolved terrain-mixing policy to a material.
 * @param {object} material Terrain material target.
 * @param {Readonly<object>} policy Resolved desktop or mobile profile.
 * @returns {Readonly<object>} The same applied policy.
 */
export function uploadMinimalMeadowTerrainMixing(material, policy) {
	Object.assign(material, {
		mixChromaticStrength: policy.chromatic.tintStrength,
		mixDetailContrast: policy.detail.contrast,
		mixDetailRepeatMultiplier: policy.detail.repeatMultiplier,
		mixDistanceFade: [
			policy.distance.fadeStart,
			policy.distance.fadeEnd
		],
		mixDrainageStrength: policy.ecology.drainageStrength,
		mixErosionStrength: policy.ecology.erosionStrength,
		mixMacroRepeatMultiplier: policy.macro.repeatMultiplier,
		mixMoistureStrength: policy.ecology.moistureStrength,
		mixNoiseWarp: policy.noise.warpStrength,
		mixRidgeStrength: policy.ecology.ridgeStrength,
		mixSlopeStrength: policy.ecology.slopeStrength,
		mixTriplanarSharpness: policy.triplanar.sharpness,
		mixWetnessStrength: policy.wetness.darkening,
		terrainMixingA: [
			policy.noise.macroScale,
			policy.detail.repeatMultiplier,
			policy.noise.patchScale,
			policy.noise.warpStrength
		],
		terrainMixingB: [
			policy.distance.fadeStart,
			policy.distance.fadeEnd,
			policy.triplanar.sharpness,
			policy.wetness.darkening
		],
		terrainMixingC: [
			policy.chromatic.tintStrength,
			policy.detail.contrast,
			policy.ecology.slopeStrength,
			policy.ecology.heightStrength
		],
		terrainMixingPolicy: policy
	});
	return policy;
}
