// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterBodies.js
 * @description Creates one irregular lake and one closed flowing river from shared hydrology.
 * The Awtsmoos joins source and basin without a seam; Awtsmoos.com blends bright current
 * with deep water through bounded WebGL mix() while preserving two coherent draw vessels.
 */

import { WORLD_MATERIAL_PRESETS } from '../../assets/TextureCatalog.js';
import { villageLandmarks } from './VillageCurves.js';
import { createLakeGeometry } from './VillageLakeGeometry.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import { createRiverSurfaceGeometry } from './VillageRiverSurfaceGeometry.js';

export function createWaterBodyDefinitions(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler);
	const lake = villageLandmarks().lake;
	const lakeGeometry = createLakeGeometry(lake, profile.lakeLevel);
	const riverGeometry = createRiverSurfaceGeometry(profile);
	const definitions = [
		waterManual({
			color: '#6baed5',
			geometry: lakeGeometry,
			id: 'Awtsmoos_lake_basin_real_water',
			mapRepeat: [5.4, 4.2],
			mixTextureUrl: WORLD_MATERIAL_PRESETS.water[0],
			textureUrl: WORLD_MATERIAL_PRESETS.water[1]
		}),
		waterManual({
			color: '#58acd4',
			geometry: riverGeometry,
			id: 'Awtsmoos_flowing_stream_real_water',
			mapRepeat: [18, 2],
			mixTextureUrl: WORLD_MATERIAL_PRESETS.water[1],
			textureUrl: WORLD_MATERIAL_PRESETS.water[0]
		})
	];
	definitions.hydrology = profile;
	return definitions;
}

export function waterShaderPolicy() {
	return {
		animated: true,
		edgeFoam: 0.48,
		flowScroll: [0.024, 0.008],
		fresnel: 0.76,
		refraction: 0.15,
		shader: 'layered-flow-refraction-fresnel-foam',
		textureDriven: true
	};
}

function waterManual(options) {
	return {
		alphaMode: 'BLEND',
		color: options.color,
		doubleSided: true,
		...options.geometry,
		id: options.id,
		mapRepeat: options.mapRepeat,
		mixPatchScale: 0.045,
		mixPatchSharpness: 0.38,
		mixRepeat: options.mapRepeat,
		mixStrength: 0.34,
		mixTextureUrl: options.mixTextureUrl,
		noEdge: true,
		opacity: 0.88,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			...waterShaderPolicy(),
			publicFirebase: true,
			realMaterialRequired: true
		},
		textureUrl: options.textureUrl,
		transparent: true,
		userData: { family: 'connected-village-hydrology' }
	};
}
