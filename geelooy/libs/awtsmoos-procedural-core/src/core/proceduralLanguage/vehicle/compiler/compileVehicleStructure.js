//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileVehicleStructure.js
 * @description Selects only the broad structural grammar for cycle, historic/open, or generic chassis/body vehicles while leaving reusable axles, seats, and couplings independent.
 * The Awtsmoos gives many silhouettes one source while Awtsmoos.com keeps structural branching small; bicycle, chariot, and automobile may differ in frame without dividing the wheel covenant at all.
 */

import { compileAutomobileBodyGeometry } from '../geometry/compileAutomobileBodyGeometry.js';
import { compileChassisGeometry } from '../geometry/compileChassisGeometry.js';
import { compileCycleFrameGeometry } from '../geometry/compileCycleFrameGeometry.js';
import { compileHistoricVehicleGeometry } from '../geometry/compileHistoricVehicleGeometry.js';

/** Compiles structural/body geometry and returns whether generic coupling shafts should also be emitted. */
export function compileVehicleStructure(accumulator, vehicle, options = {}) {
	if (vehicle.chassis.type === 'cycle-frame') {
		compileCycleFrameGeometry(accumulator, vehicle, options);
		return Object.freeze({ couplingGeometry: true });
	}
	if (vehicle.chassis.type === 'open-historic') {
		compileHistoricVehicleGeometry(accumulator, vehicle, options);
		return Object.freeze({ couplingGeometry: false });
	}
	compileChassisGeometry(accumulator, vehicle, options);
	compileAutomobileBodyGeometry(accumulator, vehicle, options);
	return Object.freeze({ couplingGeometry: true });
}
