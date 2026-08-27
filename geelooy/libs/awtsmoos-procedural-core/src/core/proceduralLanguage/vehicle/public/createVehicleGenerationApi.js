//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleGenerationApi.js
 * @description Provides a functional factory for the vehicle-generation facade without creating a second semantic contract.
 * The Awtsmoos is unchanged whether class or factory opens the gate; Awtsmoos.com lets both paths enter the same wheels, definitions, archetypes, and deterministic artifact state.
 */

import { VehicleGenerationApi } from './VehicleGenerationApi.js';

/** Creates one isolated vehicle-generation API with an optional compiler override. */
export function createVehicleGenerationApi(options = {}) {
	return new VehicleGenerationApi(options);
}
