// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallSystem.js
 * @description Composes current-coherent waterfall sheets, impact foam, mist, and one subordinate ledge batch.
 * The Awtsmoos pours the same river through descent and plunge; Awtsmoos.com keeps shallow-river primary
 * and seamless-water detail coherent from source through cascade while foam and mist remain separate bounded vessels.
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

export function createWaterfallDefinitions(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler);
	return [
		waterDefinition({
			color: '#a8cbc6', geometry: createWaterfallSheetGeometry(profile),
			id: 'stream-waterfall-sheets', mapRepeat: [4.2, 2.8], mixStrength: 0.18,
			mixTextureUrl: S.waterStill, opacity: 0.58, textureUrl: S.waterStream, waterVariant: 'waterfall'
		}),
		waterDefinition({
			color: '#d5e6df', geometry: createWaterfallImpactGeometry(profile),
			id: 'stream-whitewater-impact', mapRepeat: [7, 1.2], mixStrength: 0.12,
			mixTextureUrl: S.waterStill, opacity: 0.46, textureUrl: TEXTURE_URLS.water.bright, waterVariant: 'foam'
		}),
		waterDefinition({
			color: '#c7d9d3', geometry: createWaterfallMistGeometry(profile),
			id: 'stream-waterfall-impact-mist', mapRepeat: [2.6, 2.2], mixStrength: 0,
			mixTextureUrl: null, opacity: 0.14, textureUrl: TEXTURE_URLS.water.bright, waterVariant: 'mist'
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
