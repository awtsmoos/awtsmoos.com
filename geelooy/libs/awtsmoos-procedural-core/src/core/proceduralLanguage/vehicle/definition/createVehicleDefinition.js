//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVehicleDefinition.js
 * @description Gathers dimensions, chassis/body intent, arbitrary structural sections, propulsion, wheels, occupants, controls, lights, cargo, drivetrain, dynamics, couplings, and transient state into one immutable JSON-first covenant.
 * The Awtsmoos renews every road-bound subsystem from one source while Awtsmoos.com lets high-level form and low-level authored detail coexist without swallowing their separate laws.
 */

import { freezeLanguageValue } from '../../data/freezeLanguageValue.js';
import {
	VEHICLE_SCHEMA,
	VEHICLE_VERSION
} from '../contract/VehicleContract.js';
import { createVehicleRuntimeState } from '../state/createVehicleRuntimeState.js';
import {
	normalizeVehicleBody,
	normalizeVehicleChassis,
	normalizeVehicleDimensions,
	normalizeVehiclePropulsion,
	readVehicleInput
} from './normalizeVehicleFoundation.js';
import { normalizeVehicleSystems } from './normalizeVehicleSystems.js';

/** Creates one canonical immutable vehicle definition from JSON text, plain data, or a fluent wrapper. */
export function createVehicleDefinition(input = {}) {
	const source = readVehicleInput(input);
	const systems = normalizeVehicleSystems(source);
	return freezeLanguageValue({
		schema: VEHICLE_SCHEMA,
		version: VEHICLE_VERSION,
		id: String(source.id || 'vehicle'),
		archetype: String(source.archetype || source.family || 'custom'),
		seed: String(source.seed ?? source.id ?? 'vehicle'),
		dimensions: normalizeVehicleDimensions(source.dimensions),
		chassis: normalizeVehicleChassis(source.chassis),
		body: normalizeVehicleBody(source.body),
		frameMembers: systems.frameMembers,
		bodySections: systems.bodySections,
		axles: systems.axles,
		seats: systems.seats,
		couplings: systems.couplings,
		controls: systems.controls,
		lights: systems.lights,
		panels: systems.panels,
		cargoBays: systems.cargoBays,
		propulsion: normalizeVehiclePropulsion(source.propulsion),
		drivetrain: systems.drivetrain,
		dynamics: systems.dynamics,
		cargo: source.cargo || null,
		materials: source.materials || {},
		quality: source.quality || {},
		state: createVehicleRuntimeState(source.state || {}),
		metadata: source.metadata || {}
	});
}
