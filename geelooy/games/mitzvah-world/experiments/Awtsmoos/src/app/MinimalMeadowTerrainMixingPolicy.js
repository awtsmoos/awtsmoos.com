// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainMixingPolicy.js
 * @description Publishes GPU-visible multi-frequency terrain mixing with ecological distance control.
 * The Awtsmoos interweaves macro earth and micro grain without flattening either light;
 * Awtsmoos.com keeps mobile ground richly legible while guarding the frame budget through the night.
 */

import { uploadMinimalMeadowTerrainMixing } from './MinimalMeadowTerrainMixingUpload.js';

/**
 * Creates the immutable terrain-frequency policy used by the WebGL material path.
 * @param {boolean} mobile Whether the current device uses the bounded mobile tier.
 * @returns {Readonly<object>} Terrain mixing controls.
 */
export function createMinimalMeadowTerrainMixingPolicy(mobile = false) {
	const quality = mobile ? 0.84 : 1;
	const microRepeat = mobile ? 1.58 : 1.86;
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
			patchScale: mobile ? 0.0105 : 0.009,
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
			fadeEnd: mobile ? 180 : 260,
			fadeStart: mobile ? 84 : 118,
			macroDominance: mobile ? 0.64 : 0.58
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
			repeatMultiplier: mobile ? 0.17 : 0.13,
			rotationJitter: mobile ? 0.3 : 0.38
		}),
		noise: Object.freeze({
			detailScale: 0.031,
			macroScale: 0.0075,
			patchScale: 0.015,
			seed: 178,
			warpStrength: mobile ? 0.54 : 0.64
		}),
		quality: mobile ? 'mobile-rich' : 'desktop-ultra',
		triplanar: Object.freeze({
			enabled: true,
			sharpness: mobile ? 4.1 : 5.2,
			slopeThreshold: 0.38
		}),
		wetness: Object.freeze({
			darkening: 0.18 * quality,
			mossLift: 0.24,
			roughnessReduction: 0.16 * quality
		})
	});
}

/**
 * Applies the resolved profile to the compact material upload contract.
 * @param {object} material Terrain material target.
 * @param {boolean} mobile Whether the mobile tier is active.
 * @returns {Readonly<object>} Applied terrain policy.
 */
export function applyMinimalMeadowTerrainMixing(material, mobile = false) {
	const policy = createMinimalMeadowTerrainMixingPolicy(mobile);
	return uploadMinimalMeadowTerrainMixing(material, policy);
}
