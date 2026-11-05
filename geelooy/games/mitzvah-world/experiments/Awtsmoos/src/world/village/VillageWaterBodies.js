// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterBodies.js
 * @description Composes spring, lake, submerged bed, and continuous real river from one hydrology profile.
 * The Awtsmoos joins hidden source, spring, current, river, and lake in one descending life;
 * Awtsmoos.com lets shallow-river pixels meet seamless detail while truthful stone rests beneath the light.
 */

import { createWellspringWaterDefinition } from '../wellspring/WellspringDefinition.js';
import { villageLandmarks } from './VillageCurves.js';
import { createLakeGeometry } from './VillageLakeGeometry.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import { createRiverSurfaceGeometry } from './VillageRiverSurfaceGeometry.js?v=20260720-canonical-valley-pass-04';
import { waterShaderPolicy } from './VillageWaterMaterialPolicy.js';
import { createVillageRiverBedDefinition } from './VillageWaterRiverBedDefinition.js';
import { createVillageWaterSurfaceDefinition } from './VillageWaterSurfaceDefinition.js';
import {
	villageWaterSurfaceStyle
} from './VillageWaterVisibilityContract.js';
import { villageWaterSurfaceSources } from './VillageWaterSurfaceSources.js';

export { waterShaderPolicy };

/**
 * Creates the four canonical water-body definitions from one shared hydrology profile.
 * @param {object|Function} groundSampler Shared village ground authority.
 * @param {object|null} [hydrology=null] Optional precomputed river hydrology.
 * @returns {Array<object>} Wellspring, lake, bed, and river definitions with attached hydrology.
 */
export function createWaterBodyDefinitions(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler);
	const lake = villageLandmarks().lake;
	const definitions = [
		createWellspringWaterDefinition(profile),
		createLakeDefinition(lake, profile),
		createVillageRiverBedDefinition(profile),
		createRiverDefinition(profile)
	];
	definitions.hydrology = profile;
	return definitions;
}

function createLakeDefinition(lake, profile) {
	const style = villageWaterSurfaceStyle('lake');
	const sources = villageWaterSurfaceSources('lake');
	return createVillageWaterSurfaceDefinition({
		...style,
		geometry: createLakeGeometry(lake, profile.lakeLevel),
		id: 'Awtsmoos_lake_basin_alpine_reflection_water',
		mapRepeat: [6.8, 5.2],
		mixStrength: 0.24,
		mixTextureUrl: sources.detail,
		textureUrl: sources.primary,
		waterVariant: style.variant
	});
}

function createRiverDefinition(profile) {
	const style = villageWaterSurfaceStyle('river');
	const sources = villageWaterSurfaceSources('river');
	return createVillageWaterSurfaceDefinition({
		...style,
		geometry: createRiverSurfaceGeometry(profile),
		id: 'Awtsmoos_flowing_stream_alpine_current_water',
		mapRepeat: [22, 2.6],
		mixStrength: 0.42,
		mixTextureUrl: sources.detail,
		textureUrl: sources.primary,
		waterVariant: style.variant
	});
}
