//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createHistoricArchetype.js
 * @description Expands historic presets into dimension-derived wheels, occupancy, yokes/handles, open-body intent, controls, cargo, external drivetrain, dynamics, and material roles before caller overrides win.
 * The Awtsmoos joins horse, human, road, wheel and cargo while Awtsmoos.com lets ancient transport receive rich modern semantics without rewriting history as an automobile engine below.
 */

import { historicArchetypeParameters } from './historicArchetypeParameters.js';
import { createHistoricRichSystems } from './createHistoricRichSystems.js';
import {
	createHistoricAxles,
	createHistoricCouplings,
	createHistoricSeats
} from './createHistoricVehicleSystems.js';
import { mergeVehicleOverrides } from './mergeVehicleOverrides.js';

/** Creates one complete historic/human vehicle source with dimensions resolved before every dependent system. */
export function createHistoricArchetypeSource(id, overrides = {}) {
	const preset = historicArchetypeParameters(id);
	if (!preset) {
		return null;
	}
	const parameters = mergeVehicleOverrides(preset, {
		dimensions: overrides.dimensions,
		wheel: overrides.wheel,
		mass: overrides.dynamics?.mass
	});
	const dimensions = parameters.dimensions;
	const axles = createHistoricAxles(parameters, dimensions);
	const propulsion = {
		type: parameters.propulsion,
		drive: 'external',
		power: 0
	};
	const rich = createHistoricRichSystems(
		id,
		dimensions,
		axles,
		parameters.propulsion
	);
	const source = {
		id: overrides.id || id,
		archetype: id,
		dimensions,
		chassis: {
			type: 'open-historic',
			frameRadius: 0.035,
			thickness: 0.11
		},
		body: {
			type: 'open',
			enabled: false
		},
		axles,
		seats: createHistoricSeats(parameters, dimensions),
		couplings: createHistoricCouplings(parameters, dimensions),
		propulsion,
		dynamics: {
			mass: parameters.mass,
			tireGrip: 0.72,
			rollingResistance: 0.028,
			brakeTorque: parameters.mass * 0.35
		},
		materials: {
			chassis: 'wood',
			body: 'wood',
			seat: 'leather'
		},
		...rich
	};
	return mergeVehicleOverrides(source, overrides);
}
