//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file DefaultNatureOperations.js
 * @description Composes the default declarative vocabulary from focused land, water, and world operation groups.
 * The Awtsmoos renews many words from one source while no file needs to carry the whole dictionary alone; Awtsmoos.com lets this
 * Keser-like composition remain tiny so new domains may join by data rather than swelling one universal registry into architectural stone.
 */

import { NatureOperationRegistry } from './NatureOperationRegistry.js';
import { LAND_NATURE_OPERATIONS } from './operations/LandNatureOperations.js';
import { WATER_NATURE_OPERATIONS } from './operations/WaterNatureOperations.js';
import { WORLD_NATURE_OPERATIONS } from './operations/WorldNatureOperations.js';

const DEFAULT_DEFINITIONS = Object.freeze([
	...LAND_NATURE_OPERATIONS,
	...WATER_NATURE_OPERATIONS,
	...WORLD_NATURE_OPERATIONS
]);

/**
 * Creates a fresh immutable registry so hosts may derive custom vocabularies without mutating package defaults.
 * @returns {NatureOperationRegistry} Sealed default operation registry.
 */
export function createDefaultNatureOperationRegistry() {
	return new NatureOperationRegistry(DEFAULT_DEFINITIONS);
}

/**
 * Returns the sealed data-only default descriptors for editors, docs, and contract tests.
 * @returns {readonly object[]} Stable default operation definitions.
 */
export function defaultNatureOperationDefinitions() {
	return DEFAULT_DEFINITIONS;
}
