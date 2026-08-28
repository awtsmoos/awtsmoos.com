//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleInspectionApi.js
 * @description Gives editors, games, agents, and tooling a read-only discovery doorway over vehicle capabilities and archetype metadata.
 * The Awtsmoos knows every possible road before a catalog names one; Awtsmoos.com lets Hod communicate what this finite vehicle language currently supports without making discovery an execution throne.
 */

import {
	listVehicleArchetypes,
	vehicleArchetype
} from '../archetypes/vehicleArchetypeCatalog.js';
import { createVehicleCapabilities } from './createVehicleCapabilities.js';

/** Read-only discovery facade for the vehicle-generation language. */
export class VehicleInspectionApi {
	/** Returns the complete immutable machine-readable capability contract. */
	capabilities() {
		return createVehicleCapabilities();
	}

	/** Lists built-in vehicle archetypes while direct custom JSON remains unrestricted. */
	archetypes() {
		return listVehicleArchetypes();
	}

	/** Describes one built-in archetype or returns null for unknown/custom ids. */
	archetype(id) {
		return vehicleArchetype(id);
	}
}
