// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterSurfaceDefinition.js
 * @description Manifests transparent physical water from distinct real primary and seamless-detail sources.
 * The Awtsmoos lets a photographed current receive moving detail without confusing river, lake, and stone;
 * Awtsmoos.com keeps every animated water garment inspectable in one shared physical definition.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { createAnimatedWaterTexturePolicy } from './VillageWaterMaterialPolicy.js';
import { VILLAGE_WATER_VISIBILITY_VERSION } from './VillageWaterVisibilityContract.js';

/**
 * Creates one animated manual river or lake surface.
 * @param {object} options Surface geometry, real sources, style, repeat, and hydrology class.
 * @returns {object} Transparent physical-water world definition.
 */
export function createVillageWaterSurfaceDefinition(options) {
	return {
		alphaMode: 'BLEND',
		color: options.color,
		doubleSided: true,
		...options.geometry,
		id: options.id,
		mapImage: cachedTextureImage(options.textureUrl),
		mapRepeat: options.mapRepeat,
		mixImage: cachedTextureImage(options.mixTextureUrl),
		mixPatchScale: 0.038,
		mixPatchSharpness: 0.31,
		mixRepeat: options.mapRepeat,
		mixStrength: options.mixStrength,
		mixTextureUrl: options.mixTextureUrl,
		noEdge: true,
		opacity: options.opacity,
		shape: 'manual',
		solid: false,
		texturePolicy: createAnimatedWaterTexturePolicy({
			mixUrl: options.mixTextureUrl,
			primaryUrl: options.textureUrl,
			waterVariant: options.waterVariant
		}),
		textureUrl: options.textureUrl,
		transparent: true,
		userData: {
			family: 'connected-alpine-village-hydrology',
			visibilityAuthority: VILLAGE_WATER_VISIBILITY_VERSION,
			waterClass: options.waterVariant,
			waterVariant: options.waterVariant
		}
	};
}
