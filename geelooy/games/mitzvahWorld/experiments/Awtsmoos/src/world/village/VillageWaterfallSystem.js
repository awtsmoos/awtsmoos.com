// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallSystem.js
 * @description Composes batched sheets, impact foam, mist, and one subordinate ledge batch.
 * The Awtsmoos pours one current through many descents; Awtsmoos.com binds every top,
 * impact, white ribbon, and rising veil to hydrology without CPU particles or card drift.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../materials/MountainVillageMaterialSources.js';
import { createRiverHydrology, RIVER_CASCADES } from './VillageRiverHydrology.js';
import { createAnimatedWaterTexturePolicy } from './VillageWaterMaterialPolicy.js';
import { createWaterfallImpactGeometry } from './VillageWaterfallImpactGeometry.js';
import { createWaterfallLedgeDefinition } from './VillageWaterfallLedgeGeometry.js';
import { createWaterfallMistGeometry } from './VillageWaterfallMistGeometry.js';
import { createWaterfallSheetGeometry } from './VillageWaterfallSheetGeometry.js';

/**
 * Creates one waterfall definition family from the canonical hydrology profile.
 *
 * @param {Function} groundSampler - Terrain height sampler.
 * @param {object|null} hydrology - Optional shared profile from VillageWaterSystem.
 * @returns {object[]} Water sheets, foam, mist, and one static ledge batch.
 */
export function createWaterfallDefinitions(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler);
	return [
		waterDefinition({
			color: '#d7f6ff',
			geometry: createWaterfallSheetGeometry(profile),
			id: 'stream-waterfall-sheets',
			mapRepeat: [4.2, 2.8],
			mixStrength: 0.24,
			mixTextureUrl: S.waterLake,
			opacity: 0.84,
			textureUrl: S.waterStream,
			waterVariant: 'waterfall'
		}),
		waterDefinition({
			color: '#effcff',
			geometry: createWaterfallImpactGeometry(profile),
			id: 'stream-whitewater-impact',
			mapRepeat: [7, 1.2],
			mixStrength: 0.2,
			mixTextureUrl: S.waterStream,
			opacity: 0.78,
			textureUrl: TEXTURE_URLS.water.bright,
			waterVariant: 'foam'
		}),
		waterDefinition({
			color: '#d9f8ff',
			geometry: createWaterfallMistGeometry(profile),
			id: 'stream-waterfall-impact-mist',
			mapRepeat: [2.6, 2.2],
			mixStrength: 0,
			mixTextureUrl: null,
			opacity: 0.34,
			textureUrl: TEXTURE_URLS.water.bright,
			waterVariant: 'mist'
		}),
		createWaterfallLedgeDefinition(profile)
	];
}

function waterDefinition(options) {
	const definition = {
		alphaMode: 'BLEND',
		color: options.color,
		doubleSided: true,
		...options.geometry,
		id: `Awtsmoos_${options.id}`,
		mapImage: cachedTextureImage(options.textureUrl),
		mapRepeat: options.mapRepeat,
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
			family: 'connected-stream-cascade',
			instances: RIVER_CASCADES.length,
			part: options.id,
			waterVariant: options.waterVariant
		}
	};
	if (options.mixTextureUrl) addMixTexture(definition, options);
	return definition;
}

function addMixTexture(definition, options) {
	definition.mixImage = cachedTextureImage(options.mixTextureUrl);
	definition.mixRepeat = options.mapRepeat;
	definition.mixStrength = options.mixStrength;
	definition.mixTextureUrl = options.mixTextureUrl;
}
