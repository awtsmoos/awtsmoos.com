// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StructureMaterialStackPreset.js
 * @description Builds mountain and cottage recipes with deliberate ecological masks.
 * The Awtsmoos reveals cliff and home through stone, scree, soil, moss, timber, and metal;
 * Awtsmoos.com lets each layer answer terrain evidence instead of painting every slope alike.
 */

import { materialStackRecipe } from './MaterialStackRecipe.js';
import { presetLayer as layer } from './MaterialPresetLayer.js';
import {
	MOUNTAIN_VILLAGE_FAMILIES as F,
	MOUNTAIN_VILLAGE_SOURCES as S
} from './MountainVillageMaterialSources.js';

const HARD_ROCK = Object.freeze([0.04, 0, 0, 1]);
const SCREE = Object.freeze([0.28, 0.02, 0.02, 0.78]);
const SHELF_SOIL = Object.freeze([0.78, 0.08, 0.06, 0.2]);
const FOREST_MOSS = Object.freeze([0.58, 0.18, 0.16, 0.28]);
const DRY_GRASS = Object.freeze([0.86, 0.03, 0.02, 0.12]);

export function mountainRockStack() {
	return materialStackRecipe('mountain-rock', {
		fallbackColor: [0.32, 0.33, 0.31, 1],
		layers: [
			rock('rock-fieldstone', S.fieldstone, 100, [8, 10], 0.72, [0.2, 1], HARD_ROCK),
			rock('rock-stone-one', S.stoneOne, 99, [11, 9], 0.54, [0.28, 1], HARD_ROCK),
			rock('rock-bluestone', S.bluestone, 98, [12, 10], 0.34, [0.34, 1], HARD_ROCK),
			rock('rock-cobble-breakup', S.cobblestone, 97, [14, 12], 0.28, [0.36, 1], SCREE),
			rock('rock-floor-strata', S.stoneFloor, 96, [7, 13], 0.31, [0.42, 1], SCREE),
			rock('rock-granite', S.granite, 95, [9, 15], 0.25, [0.56, 1], HARD_ROCK),
			rock('rock-scree-sand', S.sand, 94, [18, 20], 0.3, [0.38, 1], SCREE),
			rock('rock-shelf-soil', S.soilDirtFive, 93, [20, 18], 0.35, [0, 0.48], SHELF_SOIL),
			rock('rock-forest-moss', S.darkForestFloor, 92, [16, 19], 0.32, [0, 0.38], FOREST_MOSS),
			rock('rock-dry-grass', S.dryGrass, 91, [24, 22], 0.23, [0, 0.3], DRY_GRASS)
		]
	});
}

export function cottageSurfaceStack() {
	return materialStackRecipe('cottage-surface', {
		fallbackColor: [0.45, 0.39, 0.31, 1],
		layers: [
			building('cottage-fieldstone', S.fieldstone, 100, [5, 5], 0.68),
			building('cottage-limestone', F.bricks[6], 99, [6, 7], 0.36),
			building('cottage-white-brick', F.bricks[0], 98, [8, 7], 0.28),
			building('cottage-weathered-brick', F.bricks[5], 97, [7, 9], 0.22),
			building('cottage-timber', S.wood, 96, [4, 8], 0.52),
			building('cottage-oak-variation', F.wood[2], 95, [5, 9], 0.28),
			building('cottage-roof', S.roofTile, 94, [6, 4], 0.58),
			building('cottage-roof-small-tile', F.roof[2], 93, [8, 5], 0.31),
			building('cottage-bark-trim', S.bark, 92, [3, 10], 0.26),
			building('cottage-iron', S.iron, 91, [3, 3], 0.18),
			building('cottage-gold', S.gold, 90, [2, 2], 0.14)
		]
	});
}

function rock(role, url, priority, repeat, strength, slope, zones) {
	return layer(role, url, { priority, repeat, slope, strength, zones });
}

function building(role, url, priority, repeat, strength) {
	return layer(role, url, {
		priority,
		repeat,
		strength,
		zones: [1, 1, 1, 1]
	});
}
