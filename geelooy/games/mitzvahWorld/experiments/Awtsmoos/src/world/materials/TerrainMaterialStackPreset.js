// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainMaterialStackPreset.js
 * @description Defines six broad ecological garments instead of sixteen high-frequency repeats.
 * The Awtsmoos reveals one mountain meadow through grass, earth, moss, and stone; Awtsmoos.com
 * turns each source in a distinct direction while continuous masks erase the fiction of square cells.
 */

import { materialStackRecipe } from './MaterialStackRecipe.js';
import { presetLayer as layer } from './MaterialPresetLayer.js';
import {
	MOUNTAIN_VILLAGE_SOURCES as S,
	MOUNTAIN_VILLAGE_TERRAIN_VARIANTS as T
} from './MountainVillageTerrainSources.js';

/**
 * Builds the terrain stack with phone-readable repeats and explicit ecological responsibilities.
 *
 * @returns {object} Six-layer terrain material recipe.
 */
export function mountainTerrainStack() {
	return materialStackRecipe('mountain-terrain', {
		fallbackColor: [0.31, 0.34, 0.22, 1],
		layers: [
			meadow('meadow-base-grass', T.baseGrass, 100, [8, 7], 0.52, 0.12),
			meadow('meadow-lush-grass', T.grassOne, 99, [7, 8], 0.42, -0.58, 0.22),
			earth('meadow-open-soil', S.dirt, 98, [6, 6], 0.38, 1.04),
			shoulderLayer(),
			wetLayer(),
			stoneLayer()
		]
	});
}

function meadow(role, url, priority, repeat, strength, angle, wetness = 0.08) {
	return layer(role, url, {
		angle,
		priority,
		repeat,
		slope: [0, 0.58],
		strength,
		wetness,
		zones: [1, 0.04, 0.12, 0.06]
	});
}

function earth(role, url, priority, repeat, strength, angle) {
	return layer(role, url, {
		angle,
		priority,
		repeat,
		slope: [0.08, 0.82],
		strength,
		wetness: -0.12,
		zones: [0.34, 0.18, 0.46, 0.18]
	});
}

function shoulderLayer() {
	return layer('meadow-road-shoulder', T.dirtGrassThree, {
		angle: -1.22,
		priority: 97,
		repeat: [5, 6],
		slope: [0, 0.54],
		strength: 0.64,
		wetness: -0.04,
		zones: [0.22, 1, 0.08, 0]
	});
}

function wetLayer() {
	return layer('meadow-moss-and-wet-grass', T.marshGrass, {
		angle: 0.76,
		priority: 96,
		repeat: [7, 6],
		slope: [0, 0.46],
		strength: 0.44,
		wetness: 0.72,
		zones: [0.22, 0, 1, 0]
	});
}

function stoneLayer() {
	return layer('mountain-exposed-stone', S.stone, {
		angle: 1.68,
		priority: 95,
		repeat: [5, 5],
		slope: [0.26, 1],
		strength: 0.58,
		zones: [0.06, 0, 0, 1]
	});
}
