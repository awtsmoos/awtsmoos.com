// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainSystem.js
 * @description Builds authored alpine walls with rendered rock, scree, moss, soil, and caps.
 * The Awtsmoos renews depth beyond reachable paths; Awtsmoos.com preserves source-wall and
 * outlet-pass geography while measured zone channels reveal the existing layered stack.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { referenceLightingBudget } from '../lighting/ReferenceGoldenHourPreset.js';
import { bindMaterialStack } from '../materials/MaterialStackBinding.js';
import { mountainRockStack } from '../materials/MountainVillageMaterialPresets.js';
import {
	mountainGeometry,
	snowGeometry
} from './AtmosphericMountainGeometry.js?v=20260722-authored-valley-ridge-layered-07';

const MOUNTAIN_STACK = mountainRockStack();
const PLACEMENT_MODEL = 'authored-source-walls-outlet-pass';
const BELTS = Object.freeze([
	belt(390, 188, 142, '#34433d', 152),
	belt(590, 254, 126, '#3f5260', 128),
	belt(820, 318, 110, '#52677a', 104),
	belt(1120, 382, 96, '#6c7d91', 88)
]);

export function createAtmosphericMountainDefinitions(quality = 'high') {
	const count = referenceLightingBudget(quality).mountainBelts;
	const definitions = [];
	for (const [index, options] of BELTS.slice(0, count).entries()) {
		definitions.push(mountainDefinition(options, index, quality));
		definitions.push(snowDefinition(options, index, quality));
	}
	definitions.stats = {
		activeMaterialLayers: definitions[0]?.textureLayers?.length || 0,
		belts: count,
		definitions: definitions.length,
		layeredMaterials: definitions.every(item => item.textureLayers?.length > 0),
		logicalMaterialLayers: MOUNTAIN_STACK.logicalLayerCount,
		nearestRadius: BELTS[0].radius,
		placementModel: PLACEMENT_MODEL,
		snowCaps: count,
		triangles: definitions.reduce((sum, item) => sum + item.indices.length / 3, 0),
		zoneWeighted: definitions.every(item => item.zones.length === item.vertices.length)
	};
	return definitions;
}

function mountainDefinition(options, index, quality) {
	return definition(
		`Awtsmoos_atmospheric_mountain_belt_${index}`,
		mountainGeometry(options, index),
		options.color,
		'reference-atmospheric-mountains',
		quality,
		index
	);
}

function snowDefinition(options, index, quality) {
	return definition(
		`Awtsmoos_atmospheric_mountain_snow_${index}`,
		snowGeometry(options, index),
		index === 0 ? '#b8c2c3' : '#c6d0da',
		'reference-atmospheric-mountain-snow',
		quality,
		index
	);
}

function definition(id, geometry, color, family, quality, depth) {
	const primary = MOUNTAIN_STACK.layers[0];
	return bindMaterialStack({
		...geometry,
		backfaceCull: true,
		color,
		doubleSided: false,
		id,
		mapImage: cachedTextureImage(primary.url),
		mapRepeat: primary.repeat,
		noEdge: true,
		position: { x: 0, y: -28 + depth * 5, z: 0 },
		shape: 'manual',
		solid: false,
		texturePolicy: {
			atmosphericDepth: depth,
			distanceSelected: true,
			projection: 'triplanar-alpine-strata'
		},
		textureUrl: primary.url,
		userData: {
			AwtsmoosLod: { className: 'mountain', quality },
			AwtsmoosMountainMaterial: { layered: true, zoneWeighted: true },
			family,
			geography: 'authored-valley-ridge-atlas'
		}
	}, MOUNTAIN_STACK, quality === 'low' ? 2 : quality === 'medium' ? 4 : 6);
}

function belt(radius, height, depth, color, segments) {
	return Object.freeze({ color, depth, height, radius, segments });
}
