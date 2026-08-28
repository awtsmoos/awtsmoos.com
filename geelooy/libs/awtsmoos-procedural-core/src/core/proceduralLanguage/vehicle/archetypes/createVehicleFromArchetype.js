//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleFromArchetype.js
 * @description Routes one preset id through the appropriate archetype source builder and canonical vehicle normalization without hiding custom JSON behind a closed switch.
 * The Awtsmoos gives every preset its finite garment while Awtsmoos.com lets the canonical definition remain larger than the catalog, so unknown future transport may still be authored directly.
 */

import { createVehicleDefinition } from '../definition/createVehicleDefinition.js';
import { createAutomobileArchetypeSource } from './createAutomobileArchetype.js';
import { createCycleArchetypeSource } from './createCycleArchetype.js';
import { createHistoricArchetypeSource } from './createHistoricArchetype.js';
import { createUtilityArchetypeSource } from './createUtilityArchetype.js';
import { listVehicleArchetypes } from './vehicleArchetypeCatalog.js';

const ARCHETYPE_BUILDERS = Object.freeze([
	createAutomobileArchetypeSource,
	createCycleArchetypeSource,
	createHistoricArchetypeSource,
	createUtilityArchetypeSource
]);

/** Creates one canonical immutable vehicle definition from a named built-in archetype plus overrides. */
export function createVehicleFromArchetype(id, overrides = {}) {
	const key = String(id);
	for (const builder of ARCHETYPE_BUILDERS) {
		const source = builder(key, overrides);
		if (source) {
			return createVehicleDefinition(source);
		}
	}
	const error = new Error(`B"H | Unknown vehicle archetype: ${key}`);
	error.code = 'VEHICLE_ARCHETYPE_NOT_FOUND';
	error.archetype = key;
	error.availableArchetypes = listVehicleArchetypes().map(entry => entry.id);
	throw error;
}
