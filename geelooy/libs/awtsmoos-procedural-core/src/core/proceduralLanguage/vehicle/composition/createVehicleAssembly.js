//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleAssembly.js
 * @description Normalizes road trains, truck-trailer pairs, tractor implements, bicycle trailers, and arbitrary acyclic articulated graphs whose members may use any supported vehicle authoring form.
 * The Awtsmoos is One while every member remains distinct; Awtsmoos.com lets heterogeneous vehicles join through proven sockets and an acyclic articulation tree instead of mutable scene-parenting mystery.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import { createVehicleArticulation } from '../components/createVehicleArticulation.js';
import { resolveVehicleInput } from '../resolution/resolveVehicleInput.js';
import {
	assertUniqueAssemblyIds,
	validateAssemblyArticulations
} from './vehicleAssemblyValidation.js';
import { validateVehicleAssemblyCycles } from './validateVehicleAssemblyCycles.js';

/** Creates one immutable vehicle assembly graph from heterogeneous member authoring forms and articulation edges. */
export function createVehicleAssembly(input = {}) {
	const vehicles = (input.vehicles || []).map(vehicle => {
		return resolveVehicleInput(vehicle);
	});
	const articulations = (input.articulations || []).map(entry => {
		return createVehicleArticulation(entry);
	});
	assertUniqueAssemblyIds(vehicles, 'vehicle');
	assertUniqueAssemblyIds(articulations, 'articulation');
	validateAssemblyArticulations(vehicles, articulations);
	validateVehicleAssemblyCycles(vehicles, articulations);
	return freezeLanguageValue({
		schema: 'awtsmoos.vehicle-assembly',
		version: 1,
		id: String(input.id || 'vehicle-assembly'),
		vehicles,
		articulations,
		metadata: input.metadata || {}
	});
}
