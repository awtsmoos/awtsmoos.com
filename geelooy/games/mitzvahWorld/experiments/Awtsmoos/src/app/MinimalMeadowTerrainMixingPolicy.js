// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMixingPolicy.js
 * @description Publishes GPU-visible multi-frequency terrain mixing with ecological distance control.
 * The Awtsmoos interweaves macro earth and micro grain without flattening either light;
 * Awtsmoos.com sends warp, projection, wetness, slope, height, ridge, drainage, and chroma into the shader.
 */

export function createMinimalMeadowTerrainMixingPolicy(mobile = false) {
	const quality = mobile ? 0.74 : 1;
	const microRepeat = mobile ? 1.42 : 1.86;
	return Object.freeze({
		channelOrder: Object.freeze([
			'roadCenter',
			'roadShoulder',
			'lush',
			'dry',
			'moss',
			'soil'
		]),
		chromatic: Object.freeze({
			coolShadow: 0.08 * quality,
			dryWarmth: 0.14,
			patchScale: mobile ? 0.012 : 0.009,
			tintStrength: 0.26 * quality
		}),
		detail: Object.freeze({
			contrast: 0.68 * quality,
			microRepeat,
			normalStrength: 0.58 * quality,
			repeatMultiplier: microRepeat,
			roughnessStrength: 0.4 * quality
		}),
		distance: Object.freeze({
			fadeEnd: mobile ? 160 : 260,
			fadeStart: mobile ? 74 : 118,
			macroDominance: mobile ? 0.7 : 0.58
		}),
		ecology: Object.freeze({
			drainageStrength: 0.72,
			erosionStrength: 0.66,
			heightStrength: 0.3,
			moistureStrength: 0.82,
			ridgeStrength: 0.52,
			roadClearanceStrength: 1,
			slopeStrength: 0.74
		}),
		macro: Object.freeze({
			contrast: 0.38,
			repeatMultiplier: mobile ? 0.2 : 0.13,
			rotationJitter: mobile ? 0.22 : 0.38
		}),
		noise: Object.freeze({
			detailScale: 0.031,
			macroScale: 0.0075,
			patchScale: 0.015,
			seed: 178,
			warpStrength: mobile ? 0.46 : 0.64
		}),
		quality: mobile ? 'mobile-rich' : 'desktop-ultra',
		triplanar: Object.freeze({
			enabled: true,
			sharpness: mobile ? 3.4 : 5.2,
			slopeThreshold: 0.38
		}),
		wetness: Object.freeze({
			darkening: 0.18 * quality,
			mossLift: 0.24,
			roughnessReduction: 0.16 * quality
		})
	});
}

export function applyMinimalMeadowTerrainMixing(material, mobile = false) {
	const policy = createMinimalMeadowTerrainMixingPolicy(mobile);
	Object.assign(material, {
		mixChromaticStrength: policy.chromatic.tintStrength,
		mixDetailContrast: policy.detail.contrast,
		mixDetailRepeatMultiplier: policy.detail.repeatMultiplier,
		mixDistanceFade: [policy.distance.fadeStart, policy.distance.fadeEnd],
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
