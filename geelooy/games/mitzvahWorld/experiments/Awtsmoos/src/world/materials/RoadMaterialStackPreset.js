// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RoadMaterialStackPreset.js
 * @description Defines a curved road center, softened soil shoulder, and grass transition at broad scales.
 * The Awtsmoos leads the traveler through stone and earth without a hard rectangular decree;
 * Awtsmoos.com turns six sources so every edge returns gently into the living meadow.
 */

import { materialStackRecipe } from './MaterialStackRecipe.js';
import { presetLayer as layer } from './MaterialPresetLayer.js';
import {
	MOUNTAIN_VILLAGE_FAMILIES as F,
	MOUNTAIN_VILLAGE_SOURCES as S
} from './MountainVillageMaterialSources.js';

/**
 * Builds six phone-readable road garments ordered from center toward meadow transition.
 *
 * @returns {object} Road material recipe.
 */
export function villageRoadStack() {
	return materialStackRecipe('village-road', {
		fallbackColor: [0.35, 0.27, 0.22, 1],
		layers: [
			roadCenter('road-fieldstone-center', S.fieldstone, 100, [4, 5], 0.68, 0.14),
			roadCenter('road-cobble-variation', F.stone[3], 99, [5, 4], 0.44, -0.62),
			roadCenter('road-worn-dirt-center', F.earth[1], 98, [4, 4], 0.46, 0.92),
			roadShoulder(),
			wetRoadLayer(),
			grassTransition()
		]
	});
}

function roadCenter(role, url, priority, repeat, strength, angle) {
	return layer(role, url, {
		angle,
		priority,
		repeat,
		slope: [0, 0.58],
		strength,
		wetness: -0.04,
		zones: [0.12, 1, 0.08, 0]
	});
}

function roadShoulder() {
	return layer('road-soft-soil-shoulder', F.grassTransitions[1], {
		angle: -1.16,
		priority: 97,
		repeat: [3, 4],
		slope: [0, 0.54],
		strength: 0.62,
		wetness: -0.08,
		zones: [0.42, 0.94, 0.16, 0]
	});
}

function wetRoadLayer() {
	return layer('road-damp-mud', S.mud, {
		angle: 0.74,
		priority: 96,
		repeat: [4, 3],
		slope: [0, 0.46],
		strength: 0.36,
		wetness: 0.76,
		zones: [0.08, 0.72, 0.68, 0]
	});
}

function grassTransition() {
	return layer('road-grass-transition', F.grass[5], {
		angle: 1.46,
		priority: 95,
		repeat: [3, 3],
		slope: [0, 0.48],
		strength: 0.34,
		wetness: 0.08,
		zones: [0.92, 0.28, 0.12, 0]
	});
}
