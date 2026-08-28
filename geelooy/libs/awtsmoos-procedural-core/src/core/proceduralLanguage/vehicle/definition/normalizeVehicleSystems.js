//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalizeVehicleSystems.js
 * @description Normalizes reusable axles, occupants, couplings, controls, lights, panels, cargo, arbitrary frame/body sections, drivetrain, and dynamics while validating identity and drive topology.
 * The Awtsmoos joins many systems without confusing their names; Awtsmoos.com lets structural detail and rich features remain independent while every target is proven against the actual vehicle flames.
 */

import { createAxleDefinition } from '../components/createAxleDefinition.js';
import { createVehicleBodySection } from '../components/createVehicleBodySection.js';
import { createVehicleCargoBay } from '../components/createVehicleCargoBay.js';
import { createVehicleControl } from '../components/createVehicleControl.js';
import { createVehicleCoupling } from '../components/createVehicleCoupling.js';
import { createVehicleDrivetrain } from '../components/createVehicleDrivetrain.js';
import { createVehicleDynamics } from '../components/createVehicleDynamics.js';
import { createVehicleFrameMember } from '../components/createVehicleFrameMember.js';
import { createVehicleLight } from '../components/createVehicleLight.js';
import { createVehiclePanel } from '../components/createVehiclePanel.js';
import { createVehicleSeat } from '../components/createVehicleSeat.js';
import { assertUniqueVehicleIds } from './vehicleDefinitionValidation.js';
import { validateVehicleDrivetrainTargets } from './validateVehicleDrivetrainTargets.js';

/** Creates all normalized reusable systems plus validated explicit or inferred drivetrain. */
export function normalizeVehicleSystems(source = {}) {
	const axles = normalizeCollection(source.axles, createAxleDefinition, 'axle');
	const drivetrain = createVehicleDrivetrain(
		source.drivetrain || inferVehicleDrivetrain(source, axles)
	);
	validateVehicleDrivetrainTargets(drivetrain, axles);
	return {
		axles,
		seats: normalizeCollection(source.seats, createVehicleSeat, 'seat'),
		couplings: normalizeCollection(source.couplings, createVehicleCoupling, 'coupling'),
		controls: normalizeCollection(source.controls, createVehicleControl, 'control'),
		lights: normalizeCollection(source.lights, createVehicleLight, 'light'),
		panels: normalizeCollection(source.panels, createVehiclePanel, 'panel'),
		cargoBays: normalizeCollection(source.cargoBays, createVehicleCargoBay, 'cargo bay'),
		frameMembers: normalizeCollection(source.frameMembers, createVehicleFrameMember, 'frame member'),
		bodySections: normalizeCollection(source.bodySections, createVehicleBodySection, 'body section'),
		drivetrain,
		dynamics: createVehicleDynamics(source.dynamics || {})
	};
}

/** Normalizes one semantic collection and rejects duplicate IDs. */
function normalizeCollection(value, factory, label) {
	const entries = (value || []).map(factory);
	assertUniqueVehicleIds(entries, label);
	return entries;
}

/** Derives a backwards-compatible drivetrain from legacy propulsion and driven-axle flags. */
function inferVehicleDrivetrain(source, axles) {
	const propulsion = source.propulsion || {};
	const human = propulsion.type === 'human';
	return {
		id: 'drivetrain',
		drivetrainType: human
			? 'chain-intent'
			: 'direct',
		source: 'propulsion',
		transmission: human
			? 'chain'
			: 'direct',
		axleTargets: axles
			.filter(axle => axle.driven)
			.map(axle => axle.id),
		regenerativeBraking: propulsion.type === 'electric'
	};
}
