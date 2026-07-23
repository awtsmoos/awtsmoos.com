// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterMaterialPolicy.js
 * @description Centralizes same-origin texture truth and physical alpine shader law.
 * The Awtsmoos lets lake, river, fall, foam, and mist share one current; Awtsmoos.com
 * binds every visible vessel to one canonical recipe without a parallel water simulation.
 */

import {
	assertProductionMaterialUrl
} from '../../assets/ProductionMaterialUrlPolicy.js';
import { waterShaderRecipe } from '../proceduralApi/WaterShaderRecipe.js';

const WATER_SHADER = 'alpine-two-fetch-variant-flow-fresnel-foam-water';

/** Returns immutable shader and physical behavior for one water variant. */
export function waterShaderPolicy(waterVariant = 'lake') {
	const waterClass = waterVariant === 'river' ? 'stream' : waterVariant;
	return Object.freeze({
		animated: true,
		flowLayers: 2,
		shader: WATER_SHADER,
		textureDriven: true,
		waterClass,
		waterPhysical: waterShaderRecipe(physicalKind(waterVariant)),
		waterVariant
	});
}

/** Creates validated metadata for one animated water surface. */
export function createAnimatedWaterTexturePolicy(options) {
	assertLocalWaterTexture(options.primaryUrl, `${options.waterVariant} primary`);
	if (options.mixUrl) {
		assertLocalWaterTexture(options.mixUrl, `${options.waterVariant} mix`);
	}
	return {
		...waterShaderPolicy(options.waterVariant),
		fallbackFirst: true,
		publicFirebase: false,
		realMaterialRequired: true,
		sameOrigin: true
	};
}

/** Creates validated metadata for one static hydrology-adjacent material. */
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

function physicalKind(waterVariant) {
	if (waterVariant === 'river' || waterVariant === 'stream') return 'stream';
	if (['waterfall', 'foam', 'mist'].includes(waterVariant)) return 'cascade';
	return 'lake';
}

function assertLocalWaterTexture(url, role) {
	assertProductionMaterialUrl(url, `village water ${role}`);
}
