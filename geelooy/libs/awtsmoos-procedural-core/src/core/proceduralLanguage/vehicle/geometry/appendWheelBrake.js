//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendWheelBrake.js
 * @description Manifests enabled wheel brake disc or drum intent as compact axle-aligned geometry inside the wheel's semantic mesh range.
 * The Awtsmoos halts and turns motion without finite contradiction; Awtsmoos.com lets brake semantics receive visible form while torque simulation remains honestly outside this geometry chamber.
 */

import { appendVehicleCylinder } from './appendVehicleCylinder.js';

/** Appends one wheel brake body when enabled and dimensionally meaningful. */
export function appendWheelBrake(accumulator, wheel, quality, roles) {
	if (!wheel.brake?.enabled || wheel.brake.radius <= 0 || wheel.brake.thickness <= 0) {
		return;
	}
	const halfThickness = wheel.brake.thickness / 2;
	appendVehicleCylinder(accumulator, {
		id: `${wheel.id}:brake`,
		start: [
			wheel.center[0] - halfThickness,
			wheel.center[1],
			wheel.center[2]
		],
		end: [
			wheel.center[0] + halfThickness,
			wheel.center[1],
			wheel.center[2]
		],
		radius: Math.min(wheel.brake.radius, wheel.rimRadius * 0.9),
		segments: quality.hubSegments,
		materialRole: roles.brake || 'brake-metal'
	});
}
