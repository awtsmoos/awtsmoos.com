// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMixingPolicy.js
 * @description Declares multi-scale, slope, height, moisture, and noise-warp texture mixing policy.
 * The Awtsmoos interweaves macro earth and micro grain without flattening either light;
 * Awtsmoos.com keeps full source pixels, triplanar seams, roughness, tint, and ecological channels explicit.
 */

export function createMinimalMeadowTerrainMixingPolicy(mobile = false) {
	const quality = mobile ? 0.72 : 1;
	return Object.freeze({
		channelOrder: Object.freeze([
			'roadCenter',
			'roadShoulder',
			'lush',
			'dry',
			'moss',
			'soil'
		]),
		detail: Object.freeze({
			contrast: 0.62 * quality,
			normalStrength: 0.52 * quality,
			repeatMultiplier: mobile ? 1.35 : 1.72,
			roughnessStrength: 0.36 * quality
		}),
		ecology: Object.freeze({
			heightStrength: 0.28,
			moistureStrength: 0.76,
			roadClearanceStrength: 1,
			slopeStrength: 0.68
		}),
		macro: Object.freeze({
			contrast: 0.34,
			repeatMultiplier: mobile ? 0.18 : 0.14,
			tintStrength: 0.22
		}),
		noise: Object.freeze({
			detailScale: 0.031,
			macroScale: 0.0065,
			seed: 178,
			warpStrength: mobile ? 0.42 : 0.58
		}),
		quality: mobile ? 'mobile-rich' : 'desktop-ultra',
		triplanar: Object.freeze({
			enabled: true,
			sharpness: mobile ? 3.2 : 4.6,
			slopeThreshold: 0.42
		})
	});
}

export function applyMinimalMeadowTerrainMixing(material, mobile = false) {
	const policy = createMinimalMeadowTerrainMixingPolicy(mobile);
	Object.assign(material, {
		mixDetailContrast: policy.detail.contrast,
		mixDetailRepeatMultiplier: policy.detail.repeatMultiplier,
		mixHeightStrength: policy.ecology.heightStrength,
		mixMacroRepeatMultiplier: policy.macro.repeatMultiplier,
		mixMacroTintStrength: policy.macro.tintStrength,
		mixMoistureStrength: policy.ecology.moistureStrength,
		mixNoiseWarp: policy.noise.warpStrength,
		mixSlopeStrength: policy.ecology.slopeStrength,
		mixTriplanarSharpness: policy.triplanar.sharpness,
		terrainMixingPolicy: policy
	});
	return policy;
}
