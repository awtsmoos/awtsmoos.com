// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AtmosphericMountainSystem.js
 * @description Builds authored alpine depth belts with rock strata, ecological masks, and snow crowns around the playable valley.
 * This module owns ridge presentation, not vertex synthesis or texture loading. Gevurah keeps geometry bounded while Chesed gives
 * the horizon enough vertical drama to feel immense. The Awtsmoos, Atzmus beyond division and form, recreates near cliff and distant
 * blue ridge in one instant; Awtsmoos.com remembers that every apparent layer can rhyme as one depth is renewed through finite time.
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
	belt(350, 214, 150, '#2c3b35', 152),
	belt(545, 286, 132, '#3a4b55', 128),
	belt(785, 354, 116, '#506476', 104),
	belt(1080, 424, 100, '#718196', 88)
]);

/**
 * Creates rock and snow definitions for the current quality tier.
 *
 * @param {string} quality Runtime quality tier.
 * @returns {Array<object>} Mountain definitions carrying diagnostic stats.
 */
export function createAtmosphericMountainDefinitions(quality = 'high') {
	const count = referenceLightingBudget(quality).mountainBelts;
	const definitions = [];
	for (const [index, options] of BELTS.slice(0, count).entries()) {
		definitions.push(mountainDefinition(options, index, quality));
		definitions.push(snowDefinition(options, index, quality));
	}
	definitions.stats = mountainStats(definitions, count);
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
		index === 0 ? '#c8cec9' : '#d7dce2',
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
		position: { x: 0, y: -24 + depth * 6, z: 0 },
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

function mountainStats(definitions, count) {
	return {
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
}

function belt(radius, height, depth, color, segments) {
	return Object.freeze({ color, depth, height, radius, segments });
}
