// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterBodies.js
 * @description Creates one lake and one stream using two independently animated canonical maps.
 * The Awtsmoos joins mountain source, waterfall, river, bridge, and lake without a seam;
 * Awtsmoos.com combines deep reflection and shallow current in two coherent draw vessels.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../materials/MountainVillageMaterialSources.js';
import { villageLandmarks } from './VillageCurves.js';
import { createLakeGeometry } from './VillageLakeGeometry.js';
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
			mixStrength: 0.16,
			mixTextureUrl: S.waterStream,
			textureUrl: S.waterLake,
			waterClass: 'lake'
		}),
		waterManual({
			color: '#286d77',
			geometry: createRiverSurfaceGeometry(profile),
			id: 'Awtsmoos_flowing_stream_alpine_current_water',
			mapRepeat: [22, 2.6],
			mixStrength: 0.18,
			mixTextureUrl: S.waterLake,
			textureUrl: S.waterStream,
			waterClass: 'stream'
		})
	];
	definitions.hydrology = profile;
	return definitions;
}

export function waterShaderPolicy(waterClass = 'lake') {
	return {
		animated: true,
		depthTint: waterClass === 'lake' ? 0.78 : 0.52,
		edgeFoam: waterClass === 'lake' ? 0.26 : 0.58,
		flowLayers: 4,
		flowScroll: waterClass === 'lake'
			? [[0.018, 0.011], [-0.012, 0.021]]
			: [[0.032, 0.009], [-0.018, 0.027]],
		fresnel: 0.82,
		goldenSunGlint: 1.72,
		microRipples: true,
		refraction: waterClass === 'lake' ? 0.18 : 0.12,
		shader: 'alpine-dual-flow-refraction-fresnel-foam-water',
		textureDriven: true,
		waterClass
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
		opacity: options.waterClass === 'lake' ? 0.68 : 0.64,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			...waterShaderPolicy(options.waterClass),
			fallbackFirst: true,
			publicFirebase: true,
			realMaterialRequired: true
		},
		textureUrl: options.textureUrl,
		transparent: true,
		userData: { family: 'connected-alpine-village-hydrology', waterClass: options.waterClass }
	};
}
