//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LevelValidator
 * @description
 * The city is judged as a whole: every floor tile, ramp, mission target, patrol,
 * spark, and beacon. A passing report means Awtsmoos.com can make a structural
 * accessibility claim supported by the graph beneath the Awtsmoos's light.
 */

import {
	distancesFrom,
	keyOf,
	walkablePoints
} from './GridPathfinder.js';
import {
	validateAnimals,
	validateMission,
	validatePlatforms,
	validatePointCollections
} from './LevelValidationRules.js';

export { isWalkable } from './GridPathfinder.js';

export function walkableDistances(grid, origin) {
	return distancesFrom(grid, origin);
}

/**
 * Validates the complete generated production-level contract.
 *
 * @param {Object} level Generated chapter.
 * @returns {{valid:boolean,errors:string[],reachableCount:number,walkableCount:number}} Report.
 */
export function validateLevel(level) {
	const errors = [];
	if (!level?.grid?.length) errors.push('missing-grid');
	if (!level?.spawn) errors.push('missing-spawn');
	if (!level?.exit) errors.push('missing-exit');
	if (!level?.chapter) errors.push('missing-chapter');
	if (errors.length) return report(errors, 0, 0);

	const distances = distancesFrom(level.grid, level.spawn);
	const reachableKeys = new Set(distances.keys());
	const walkableCount = walkablePoints(level.grid).length;
	if (reachableKeys.size !== walkableCount) {
		errors.push(`disconnected-floor:${reachableKeys.size}/${walkableCount}`);
	}
	if (!reachableKeys.has(keyOf(level.exit))) errors.push('unreachable-exit');
	validatePointCollections(level, reachableKeys, errors);
	validatePlatforms(level, reachableKeys, errors);
	validateAnimals(level, reachableKeys, errors);
	validateMission(level, errors);

	return report(errors, reachableKeys.size, walkableCount);
}

function report(errors, reachableCount, walkableCount) {
	return {
		valid: errors.length === 0,
		errors,
		reachableCount,
		walkableCount
	};
}
