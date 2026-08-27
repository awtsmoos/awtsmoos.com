//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VehicleSystemApi.js
 * @description Exposes standalone reusable vehicle subsystem constructors without forcing callers through archetype ownership or a giant facade.
 * The Awtsmoos is One while wheel, axle, drivetrain, control, light, panel, cargo, coupling, and state receive distinct finite vessels; Awtsmoos.com lets each system travel freely between car, bike, chariot, trailer, rover, and future designs.
 */

import { createAxleDefinition } from '../components/createAxleDefinition.js';
import { createVehicleArticulation } from '../components/createVehicleArticulation.js';
import { createVehicleCargoBay } from '../components/createVehicleCargoBay.js';
import { createVehicleControl } from '../components/createVehicleControl.js';
import { createVehicleCoupling } from '../components/createVehicleCoupling.js';
import { createVehicleDrivetrain } from '../components/createVehicleDrivetrain.js';
import { createVehicleDynamics } from '../components/createVehicleDynamics.js';
import { createVehicleLight } from '../components/createVehicleLight.js';
import { createVehiclePanel } from '../components/createVehiclePanel.js';
import { createVehicleSeat } from '../components/createVehicleSeat.js';
import { createWheelDefinition } from '../components/createWheelDefinition.js';
import { createWheelMechanics } from '../components/createWheelMechanics.js';
import { createVehicleRuntimeState } from '../state/createVehicleRuntimeState.js';

/** Focused factory facade for reusable vehicle subsystems and transient state. */
export class VehicleSystemApi {
	wheel(input = {}) {
		return createWheelDefinition(input);
	}

	wheelMechanics(input = {}, dimensions = {}) {
		return createWheelMechanics(input, dimensions);
	}

	axle(input = {}) {
		return createAxleDefinition(input);
	}

	seat(input = {}) {
		return createVehicleSeat(input);
	}

	coupling(input = {}) {
		return createVehicleCoupling(input);
	}

	drivetrain(input = {}) {
		return createVehicleDrivetrain(input);
	}

	dynamics(input = {}) {
		return createVehicleDynamics(input);
	}

	control(input = {}) {
		return createVehicleControl(input);
	}

	light(input = {}) {
		return createVehicleLight(input);
	}

	panel(input = {}) {
		return createVehiclePanel(input);
	}

	cargoBay(input = {}) {
		return createVehicleCargoBay(input);
	}

	articulation(input = {}) {
		return createVehicleArticulation(input);
	}

	state(input = {}) {
		return createVehicleRuntimeState(input);
	}
}
