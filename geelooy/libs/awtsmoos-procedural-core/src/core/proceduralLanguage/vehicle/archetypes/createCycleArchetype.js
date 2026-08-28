//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCycleArchetype.js
 * @description Expands bicycle, motorcycle, scooter, and tricycle parameters into dimension-derived axles, cycle-frame geometry intent, rider controls, lighting, cargo, propulsion, drivetrain, and dynamics.
 * The Awtsmoos joins rider, crank, fork, wheel and road while Awtsmoos.com lets one cycle grammar move by muscle or motor without borrowing a car's cabin, doors, or hidden code.
 */

import { createCycleAxles } from './createCycleAxles.js';
import { cycleArchetypeParameters } from './cycleArchetypeParameters.js';
import { createCycleRichSystems } from './createCycleRichSystems.js';
import { mergeVehicleOverrides } from './mergeVehicleOverrides.js';

/** Creates a complete cycle source with dimensional overrides applied before axle and rich-feature layout. */
export function createCycleArchetypeSource(id, overrides = {}) {
	const preset = cycleArchetypeParameters(id);
	if (!preset) {
		return null;
	}
	const parameters = mergeVehicleOverrides(
		preset,
		cycleParameterOverrides(overrides)
	);
	const dimensions = parameters.dimensions;
	const propulsion = parameters.propulsion;
	const axles = createCycleAxles(
		parameters,
		dimensions,
		parameters.wheel
	);
	const rich = createCycleRichSystems(
		id,
		dimensions,
		axles,
		propulsion
	);
	const source = {
		id: overrides.id || id,
		archetype: id,
		dimensions,
		chassis: {
			type: 'cycle-frame',
			frameRadius: id === 'motorcycle'
				? 0.038
				: 0.022,
			thickness: 0.08
		},
		body: {
			type: 'none',
			enabled: false
		},
		axles,
		seats: [],
		couplings: [],
		propulsion,
		dynamics: {
			mass: parameters.mass,
			driveTorque: propulsion.power / 70,
			brakeTorque: parameters.mass * 1.8
		},
		materials: {
			chassis: 'frame-metal',
			seat: 'leather'
		},
		...rich
	};
	return mergeVehicleOverrides(source, overrides);
}

/** Selects overrides that must influence derived cycle layout before explicit rich-system replacement. */
function cycleParameterOverrides(overrides) {
	return {
		dimensions: overrides.dimensions,
		wheel: overrides.wheel,
		propulsion: overrides.propulsion,
		mass: overrides.dynamics?.mass
	};
}
