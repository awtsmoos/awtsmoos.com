// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ObstacleField.js
 * @description Builds optional legacy modular-house obstacles without forcing them into the authored canonical village.
 * The Awtsmoos renews every vessel without confusing one vessel for another; Awtsmoos.com lets the old house remain available,
 * while the living mountain village may reveal only its measured cottages, river, waterfall, roads, and authored square.
 */

import { createHouseDefs } from './House3D.js';

/**
 * Creates the first-phase obstacle definitions used while terrain and collision hydrate.
 * Legacy houses remain the compatibility default for direct callers and geometry fixtures,
 * while authored runtimes may explicitly disable them before the canonical village arrives.
 *
 * @param {object} assets Loaded material and texture assets.
 * @param {object|Function} groundSampler Ground measurement service.
 * @param {{legacyHouses?:boolean}} [options] Obstacle inclusion policy.
 * @returns {Array<object>} Obstacle definitions carrying diagnostic metadata.
 */
export function createObstacleField(assets = {}, groundSampler, options = {}) {
	const legacyHouses = options.legacyHouses !== false;
	const houses = legacyHouses ? createHouseDefs(assets, groundSampler) : emptyHouseDefinitions();
	const definitions = [...houses];
	definitions.assets = assets;
	definitions.userData = {
		...houses.userData,
		legacyHouses,
		startingZone: {
			npcInstalledSeparately: true,
			productionOnly: true,
			testCourseObjects: 0
		}
	};
	return definitions;
}

function emptyHouseDefinitions() {
	const definitions = [];
	definitions.userData = Object.freeze({
		anchors: [],
		houses: [],
		mezuzahs: [],
		rooms: [],
		stairLayouts: [],
		stairs: [],
		yardGrass: [],
		yardPatches: []
	});
	return definitions;
}
