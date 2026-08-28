//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAutomobileArchetype.js
 * @description Expands automobile parameters into dimension-derived axle, occupancy, body, propulsion, dynamics, material, control, light, panel, cargo, and drivetrain semantics before explicit caller overrides win.
 * The Awtsmoos joins proportion to function while Awtsmoos.com keeps this archetype coordinator thin; richer road vehicles grow through smaller subsystem vessels instead of one monolithic hymn.
 */

import { automobileArchetypeParameters } from './automobileArchetypeParameters.js';
import { createAutomobileAxles } from './createAutomobileAxles.js';
import {
	createAutomobileCouplings,
	createAutomobileSeats
} from './createAutomobileOccupancy.js';
import { createAutomobileRichSystems } from './createAutomobileRichSystems.js';
import { mergeVehicleOverrides } from './mergeVehicleOverrides.js';

/** Creates one automobile source record with dimensional overrides applied before every dependent system is positioned. */
export function createAutomobileArchetypeSource(id, overrides = {}) {
	const preset = automobileArchetypeParameters(id);
	if (!preset) {
		return null;
	}
	const parameters = mergeVehicleOverrides(
		preset,
		parameterOverrides(overrides)
	);
	const dimensions = parameters.dimensions;
	const propulsion = parameters.propulsion;
	const axles = createAutomobileAxles(
		id,
		dimensions,
		parameters.wheel,
		parameters.threeAxles
	);
	const rich = createAutomobileRichSystems(
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
			type: id === 'truck'
				? 'ladder'
				: 'platform'
		},
		body: {
			type: parameters.bodyType,
			enabled: true
		},
		axles,
		seats: createAutomobileSeats(parameters.seatCount, dimensions),
		couplings: createAutomobileCouplings(id, dimensions),
		propulsion,
		dynamics: {
			mass: parameters.mass,
			driveTorque: propulsion.power / 90,
			brakeTorque: parameters.mass * 2.4
		},
		materials: {
			chassis: 'frame-metal',
			body: 'body-paint',
			seat: 'fabric'
		},
		...rich
	};
	return mergeVehicleOverrides(source, overrides);
}

/** Selects only overrides that must influence derived placement before final array/system replacement. */
function parameterOverrides(overrides) {
	return {
		dimensions: overrides.dimensions,
		wheel: overrides.wheel,
		bodyType: overrides.body?.type,
		mass: overrides.dynamics?.mass,
		propulsion: overrides.propulsion
	};
}
