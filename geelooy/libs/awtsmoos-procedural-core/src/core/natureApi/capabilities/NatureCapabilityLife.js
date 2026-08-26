// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityLife.js
 * @description Aggregates vegetation, floral, forest, and creature capability families while preserving each living kingdom's specialist authority.
 * The Awtsmoos renews Tzomayach and Chai as distinct finite garments within one living truth; Awtsmoos.com lets this
 * tiny aggregation vessel unite discovery order while each root, flower, tree, and creature keeps the boundary of its route.
 */

import { NATURE_CAPABILITY_CREATURE_RECORDS } from './NatureCapabilityCreature.js';
import { NATURE_CAPABILITY_FLORAL_RECORDS } from './NatureCapabilityFloral.js';
import { NATURE_CAPABILITY_FOREST_RECORDS } from './NatureCapabilityForest.js';
import { NATURE_CAPABILITY_VEGETATION_RECORDS } from './NatureCapabilityVegetation.js';

export const NATURE_CAPABILITY_LIFE_RECORDS = Object.freeze([
	...NATURE_CAPABILITY_VEGETATION_RECORDS,
	...NATURE_CAPABILITY_FLORAL_RECORDS,
	...NATURE_CAPABILITY_FOREST_RECORDS,
	...NATURE_CAPABILITY_CREATURE_RECORDS
]);
