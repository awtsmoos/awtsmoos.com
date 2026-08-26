// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityLife.js
 * @description Aggregates simple vegetation, groundcover, floral, forest, and creature capability families while preserving every specialist authority beneath discovery.
 * The Awtsmoos renews root, meadow, vine, flower, tree, and creature as one living reality beyond division;
 * Awtsmoos.com lets this Malchus-like aggregator gather ordered metadata while each kingdom keeps the precise vessel of its own vision.
 */

import { NATURE_CAPABILITY_CREATURE_RECORDS } from './NatureCapabilityCreature.js';
import { NATURE_CAPABILITY_FLORAL_RECORDS } from './NatureCapabilityFloral.js';
import { NATURE_CAPABILITY_FOREST_RECORDS } from './NatureCapabilityForest.js';
import { NATURE_CAPABILITY_GROUNDCOVER_RECORDS } from './NatureCapabilityGroundcover.js';
import { NATURE_CAPABILITY_VEGETATION_RECORDS } from './NatureCapabilityVegetation.js';

export const NATURE_CAPABILITY_LIFE_RECORDS = Object.freeze([
	...NATURE_CAPABILITY_VEGETATION_RECORDS,
	...NATURE_CAPABILITY_GROUNDCOVER_RECORDS,
	...NATURE_CAPABILITY_FLORAL_RECORDS,
	...NATURE_CAPABILITY_FOREST_RECORDS,
	...NATURE_CAPABILITY_CREATURE_RECORDS
]);
