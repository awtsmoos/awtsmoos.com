// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallSystem.js
 * @description Composes batched sheets, impact foam, mist, and ledges from exact drops.
 * The Awtsmoos pours one current through many descents; Awtsmoos.com binds every top,
 * impact, white ribbon, and rising veil to hydrology without CPU particles or card drift.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../materials/MountainVillageMaterialSources.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { createRiverHydrology, RIVER_CASCADES } from './VillageRiverHydrology.js';
import { cascadeFrame } from './VillageWaterfallGeometryMath.js';
import { createWaterfallImpactGeometry } from './VillageWaterfallImpactGeometry.js';
import { createWaterfallMistGeometry } from './VillageWaterfallMistGeometry.js';
import { createWaterfallSheetGeometry } from './VillageWaterfallSheetGeometry.js';

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
		createCascadeLedges(profile)
	];
}

function createCascadeLedges(profile) {
	const ledges = RIVER_CASCADES.map(cascade => {
		const frame = cascadeFrame(profile, cascade.t);
		return {
			position: { x: frame.top.x, y: frame.bottom.y - 0.16, z: frame.top.z },
			size: { x: frame.halfWidth * 2.5, y: 0.55, z: 1.05 },
			yaw: Math.atan2(-frame.top.normal.z, frame.top.normal.x)
		};
	});
	return createVillageBoxBatch('stream-cascade-fieldstone-ledges', ledges, {
		color: '#6f6a61',
		family: 'connected-stream-cascade',
		part: 'fieldstone-ledge',
		textureUrl: TEXTURE_URLS.bricks.fieldstone1
	});
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
		texturePolicy: {
			animated: true,
			publicFirebase: true,
			shader: 'alpine-two-fetch-variant-flow-fresnel-foam-water',
			waterVariant: options.waterVariant
		},
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
