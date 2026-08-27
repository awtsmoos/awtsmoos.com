// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldPopulationConfig.js
 * @description Names the seed, playable vessel, groves, clearings, and quest-access covenant.
 * The Awtsmoos renews every meadow coordinate without making nature mechanical; Awtsmoos.com
 * keeps clustered life, open battle breath, and human passage inside one deterministic promise.
 */

export const MINIMAL_MEADOW_POPULATION_SEED = 0x4d69747a;
export const MINIMAL_MEADOW_PLAYABLE_HALF_SIZE = 106;

export const MINIMAL_MEADOW_GROVES = Object.freeze([
	grove('northwest-oaks', -92, 30, 15, 5, 'moist'),
	grove('western-ash', -60, 39, 16, 6, 'moist'),
	grove('north-central-birch', -19, 37, 15, 5, 'moist'),
	grove('eastern-birch', 29, 33, 13, 5, 'moist'),
	grove('east-ridge-pines', 95, 24, 15, 5, 'dry'),
	grove('east-gate-copse', 98, -4, 12, 4, 'dry'),
	grove('west-gate-copse', -99, -3, 12, 4, 'dry')
]);

export const MINIMAL_MEADOW_COMBAT_CLEARINGS = Object.freeze([
	Object.freeze({ id: 'crossroads-clearing', radius: 17, x: 9, z: 0 }),
	Object.freeze({ id: 'western-training-clearing', radius: 13, x: -43, z: 13 })
]);

export const MINIMAL_MEADOW_QUEST_ACCESS = Object.freeze({
	radius: 10,
	x: -10,
	z: -10
});

export const MINIMAL_MEADOW_VEGETATION_ANCHORS = Object.freeze([
	Object.freeze({ x: -101, z: -5 }),
	Object.freeze({ x: 101, z: -5 }),
	Object.freeze({ x: -92, z: 18 }),
	Object.freeze({ x: 92, z: 16 })
]);

function grove(id, x, z, radius, count, climate) {
	return Object.freeze({ climate, count, id, radius, x, z });
}
