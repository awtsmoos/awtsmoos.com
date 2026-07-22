// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterMaterialPolicy.js
 * @description Centralizes same-origin material truth for every village water definition.
 * The Awtsmoos lets lake, river, foam, mist, reeds, and wet stone wear garments from one law;
 * Awtsmoos.com validates each local texture once so no parallel material story can arise.
 */

import {
	assertProductionMaterialUrl
} from '../../assets/ProductionMaterialUrlPolicy.js';

const WATER_SHADER = 'alpine-two-fetch-variant-flow-fresnel-foam-water';

/**
 * Preserves the public shader description used by existing callers.
 *
 * @param {string} [waterVariant='lake'] - Lake, river, waterfall, foam, or mist.
 * @returns {object} Immutable shader behavior without texture ownership metadata.
 */
export function waterShaderPolicy(waterVariant = 'lake') {
	return Object.freeze({
		animated: true,
		flowLayers: 2,
		shader: WATER_SHADER,
		textureDriven: true,
		waterClass: waterVariant === 'river' ? 'stream' : waterVariant,
		waterVariant
	});
}

/**
 * Creates validated metadata for one animated water surface.
 *
 * @param {object} options - Texture and water-variant options.
 * @returns {object} Truthful same-origin runtime metadata.
 */
export function createAnimatedWaterTexturePolicy(options) {
	assertLocalWaterTexture(options.primaryUrl, `${options.waterVariant} primary`);
	if (options.mixUrl) assertLocalWaterTexture(options.mixUrl, `${options.waterVariant} mix`);

	return {
		...waterShaderPolicy(options.waterVariant),
		fallbackFirst: true,
		publicFirebase: false,
		realMaterialRequired: true,
		sameOrigin: true
	};
}

/**
 * Creates validated metadata for one static hydrology-adjacent material.
 *
 * @param {object} options - Texture, role, and optional shader options.
 * @returns {object} Truthful same-origin runtime metadata.
 */
export function createStaticWaterTexturePolicy(options) {
	assertLocalWaterTexture(options.primaryUrl, options.role);
	const policy = {
		fallbackFirst: true,
		publicFirebase: false,
		realMaterialRequired: true,
		role: options.role,
		sameOrigin: true
	};

	if (options.shader) policy.shader = options.shader;
	if (Number.isFinite(options.tileWorld)) policy.tileWorld = options.tileWorld;
	return policy;
}

function assertLocalWaterTexture(url, role) {
	assertProductionMaterialUrl(url, `village water ${role}`);
}
