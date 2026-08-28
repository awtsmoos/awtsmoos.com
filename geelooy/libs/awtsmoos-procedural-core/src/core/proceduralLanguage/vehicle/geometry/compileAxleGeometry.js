//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileAxleGeometry.js
 * @description Compiles styled arbitrary axles, optional differential housing, every wheel member, and rich steering/suspension semantics while supporting zero, one, paired, dual, or custom wheel membership.
 * The Awtsmoos joins many wheels to one station without demanding a pair; Awtsmoos.com lets bicycle spindle, chariot beam, truck axle, rover bogie, and custom mechanism share one deterministic geometry layer.
 */

import { appendAxleDifferential } from './appendAxleDifferential.js';
import { appendVehicleCylinder } from './appendVehicleCylinder.js';
import { compileWheelGeometry } from './compileWheelGeometry.js';
import { manifestedWheelCenter } from './createWheelTransformAccumulator.js';

/** Compiles visible axle geometry, sockets, wheel members, and portable low-level axle kinematics. */
export function compileAxleGeometry(accumulator, axle, options = {}) {
	if (axle.geometry.shaftVisible) {
		appendAxleShaft(accumulator, axle);
	}
	appendAxleDifferential(accumulator, axle);
	accumulator.socket(`axle.${axle.id}`, {
		kind: 'axle-center',
		position: axle.position,
		forward: [0, 1, 0],
		up: [0, 0, 1]
	});
	for (const wheel of axle.wheels) {
		compileWheelGeometry(accumulator, wheel, options);
	}
	accumulator.kinematic({
		id: axle.id,
		kind: 'axle',
		position: axle.position,
		steering: axle.steering,
		suspension: axle.suspension,
		geometry: axle.geometry,
		driven: axle.driven,
		braked: axle.braked,
		wheelIds: axle.wheels.map(wheel => wheel.id)
	});
}

/** Appends one non-degenerate styled shaft spanning manifested wheel centers or declared track width. */
function appendAxleShaft(accumulator, axle) {
	const extents = axleWheelExtents(axle);
	accumulator.beginComponent({
		id: axle.id,
		kind: 'axle',
		materialRole: axle.geometry.materialRole,
		metadata: axle.geometry
	});
	appendVehicleCylinder(accumulator, {
		id: `${axle.id}:shaft`,
		start: [extents.minimum, axle.position[1], axle.position[2]],
		end: [extents.maximum, axle.position[1], axle.position[2]],
		radius: axle.geometry.shaftRadius,
		segments: axle.geometry.shaftSegments,
		materialRole: axle.geometry.materialRole
	});
	accumulator.endComponent();
}

/** Returns shaft X extents that remain valid for zero, one, or many aligned wheels. */
function axleWheelExtents(axle) {
	if (axle.wheels.length >= 2) {
		const centers = axle.wheels.map(wheel => {
			return manifestedWheelCenter(wheel)[0];
		});
		return {
			minimum: Math.min(...centers),
			maximum: Math.max(...centers)
		};
	}
	if (axle.wheels.length === 1) {
		return singleWheelExtents(axle, axle.wheels[0]);
	}
	return {
		minimum: axle.position[0] - axle.trackWidth / 2,
		maximum: axle.position[0] + axle.trackWidth / 2
	};
}

/** Returns nonzero shaft extents around one manifested wheel center. */
function singleWheelExtents(axle, wheel) {
	const centerX = manifestedWheelCenter(wheel)[0];
	const halfLength = Math.max(
		wheel.width * 0.42,
		axle.trackWidth * 0.5,
		0.02
	);
	return {
		minimum: centerX - halfLength,
		maximum: centerX + halfLength
	};
}
