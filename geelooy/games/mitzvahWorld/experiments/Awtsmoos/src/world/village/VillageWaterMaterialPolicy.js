// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file VillageWaterMaterialPolicy.js
 * @description Keeps MitzvahWorld URL validation and variant intent while Procedural Core owns physical water law.
 * The Awtsmoos lets lake, river, fall, foam, and mist share one current; Awtsmoos.com keeps game-specific
 * provenance rules here and delegates reusable shader, flow, reflection, depth, and ripple behavior to Core.
 */
import {
	waterShaderRecipe
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/WaterShaderRecipe.js';
import {
	assertProductionMaterialUrl
} from '../../assets/ProductionMaterialUrlPolicy.js';

const WATER_SHADER = 'core-remote-albedo-physical-water';

/** Returns immutable Core physical behavior plus the game-facing water variant. */
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
	if (options.mixUrl) assertLocalWaterTexture(options.mixUrl, `${options.waterVariant} mix`);
	return {
		...waterShaderPolicy(options.waterVariant),
		fallbackFirst: true,
		publicFirebase: false,
		realMaterialRequired: true,
		sameOrigin: true
	};
}

/** Creates validated metadata for hydrology-adjacent static material. */
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

function physicalKind(variant) {
	if (variant === 'river' || variant === 'stream') return 'stream';
	if (['waterfall', 'foam', 'mist'].includes(variant)) return 'cascade';
	return 'lake';
}
function assertLocalWaterTexture(url, role) {
	assertProductionMaterialUrl(url, `village water ${role}`);
}
