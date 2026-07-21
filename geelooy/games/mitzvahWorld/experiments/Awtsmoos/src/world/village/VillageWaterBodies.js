// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterBodies.js
 * @description Composes lake, static riverbed depth, and one animated river surface.
 * The Awtsmoos joins mountain source, waterfall, bridge, river, and lake without a seam;
 * Awtsmoos.com reveals the concealed stone vessel beneath the current with one bounded draw.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../materials/MountainVillageMaterialSources.js';
import { villageLandmarks } from './VillageCurves.js';
import { createLakeGeometry } from './VillageLakeGeometry.js';
import { createRiverBedGeometry } from './VillageRiverBedGeometry.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import { createRiverSurfaceGeometry } from './VillageRiverSurfaceGeometry.js?v=20260720-canonical-valley-pass-04';

export function createWaterBodyDefinitions(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler);
	const lake = villageLandmarks().lake;
	const definitions = [
		waterManual({
			color: '#1f6470',
			geometry: createLakeGeometry(lake, profile.lakeLevel),
			id: 'Awtsmoos_lake_basin_alpine_reflection_water',
			mapRepeat: [6.8, 5.2],
			mixStrength: 0.18,
			mixTextureUrl: S.waterStream,
			opacity: 0.7,
			textureUrl: S.waterLake,
			waterVariant: 'lake'
		}),
		riverBedManual(profile),
		waterManual({
			color: '#286d77',
			geometry: createRiverSurfaceGeometry(profile),
			id: 'Awtsmoos_flowing_stream_alpine_current_water',
			mapRepeat: [22, 2.6],
			mixStrength: 0.22,
			mixTextureUrl: S.waterLake,
			opacity: 0.67,
			textureUrl: S.waterStream,
			waterVariant: 'river'
		})
	];
	definitions.hydrology = profile;
	return definitions;
}

export function waterShaderPolicy(waterVariant = 'lake') {
	return {
		animated: true,
		flowLayers: 2,
		shader: 'alpine-two-fetch-variant-flow-fresnel-foam-water',
		textureDriven: true,
		waterClass: waterVariant === 'river' ? 'stream' : waterVariant,
		waterVariant
	};
}

function riverBedManual(profile) {
	return {
		color: '#394843',
		doubleSided: true,
		...createRiverBedGeometry(profile),
		id: 'Awtsmoos_river_bed_thalweg_wet_fieldstone',
		mapImage: cachedTextureImage(S.fieldstone),
		mapRepeat: [20, 3.4],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			fallbackFirst: true,
			publicFirebase: true,
			realMaterialRequired: true,
			role: 'wet-river-stone',
			shader: 'terrain-transition',
			tileWorld: 0.92
		},
		textureUrl: S.fieldstone,
		transparent: false,
		userData: {
			family: 'connected-alpine-village-hydrology',
			part: 'river-bed-channel',
			staticGeometry: true
		}
	};
}

function waterManual(options) {
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
		texturePolicy: {
			...waterShaderPolicy(options.waterVariant),
			fallbackFirst: true,
			publicFirebase: true,
			realMaterialRequired: true
		},
		textureUrl: options.textureUrl,
		transparent: true,
		userData: {
			family: 'connected-alpine-village-hydrology',
			waterClass: options.waterVariant,
			waterVariant: options.waterVariant
		}
	};
}
