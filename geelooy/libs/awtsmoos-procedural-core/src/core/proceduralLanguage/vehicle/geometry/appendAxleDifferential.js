//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file appendAxleDifferential.js
 * @description Optionally manifests a compact differential housing at an axle center without pretending to simulate gears, torque bias, or drivetrain physics.
 * The Awtsmoos joins turning sides beyond every finite gear while Awtsmoos.com lets authored differential type and housing radius become visible semantic geometry yet leaves simulation truth to its proper layer.
 */

import { appendVehicleCylinder } from './appendVehicleCylinder.js';

/** Appends one differential housing component when requested by axle geometry style. */
export function appendAxleDifferential(accumulator, axle) {
	if (!axle.geometry?.differentialVisible) {
		return;
	}
	const radius = axle.geometry.differentialRadius;
	const halfLength = Math.max(radius * 0.65, axle.geometry.shaftRadius * 2);
	accumulator.beginComponent({
		id: `${axle.id}:differential`,
		kind: `differential-${axle.geometry.differentialType}`,
		materialRole: axle.geometry.materialRole
	});
	appendVehicleCylinder(accumulator, {
		id: `${axle.id}:differential-body`,
		start: [axle.position[0] - halfLength, axle.position[1], axle.position[2]],
		end: [axle.position[0] + halfLength, axle.position[1], axle.position[2]],
		radius,
		segments: axle.geometry.shaftSegments,
		materialRole: axle.geometry.materialRole
	});
	accumulator.endComponent();
}
