// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainSystem.js
 * @description Builds canonical full-source alpine belts, scree, moss, soil, and snow caps.
 * The Awtsmoos renews depth beyond reachable paths; Awtsmoos.com spends two static draws per
 * belt while a six-layer triplanar stack replaces flat tint and forbidden preview textures.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { referenceLightingBudget } from '../lighting/ReferenceGoldenHourPreset.js';
import { bindMaterialStack } from '../materials/MaterialStackBinding.js';
import { mountainRockStack } from '../materials/MountainVillageMaterialPresets.js';
import {
	mountainGeometry,
	snowGeometry
} from './AtmosphericMountainGeometry.js?v=20260720-canonical-valley-pass-04';

const MOUNTAIN_STACK = mountainRockStack();
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
		belts: count,
		definitions: definitions.length,
		logicalMaterialLayers: MOUNTAIN_STACK.logicalLayerCount,
		nearestRadius: BELTS[0].radius,
		snowCaps: count,
		triangles: definitions.reduce((sum, item) => sum + item.indices.length / 3, 0)
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
			family
		}
	}, MOUNTAIN_STACK, quality === 'low' ? 2 : quality === 'medium' ? 4 : 6);
}

function belt(radius, height, depth, color, segments) {
	return Object.freeze({ color, depth, height, radius, segments });
}
