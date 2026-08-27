//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file publishWheelSemantics.js
 * @description Publishes manifested wheel-center attachment plus low-level alignment, contact, brake, visual geometry, spin, steering, drive, and radius semantics after topology generation.
 * The Awtsmoos turns the wheel without depending on a simulation clock; Awtsmoos.com keeps kinematic and authored detail as portable data so physics, animation, editor, and gameplay may share the same dock.
 */

import { manifestedWheelCenter } from './createWheelTransformAccumulator.js';

/** Publishes one wheel socket and one rich kinematic record into the shared vehicle accumulator. */
export function publishWheelSemantics(accumulator, wheel) {
	const center = manifestedWheelCenter(wheel);
	accumulator.socket(`wheel.${wheel.id}`, {
		kind: 'wheel-center',
		position: center,
		forward: [0, 1, 0],
		up: [0, 0, 1],
		designCenter: wheel.center,
		alignment: wheel.alignment
	});
	accumulator.kinematic({
		id: wheel.id,
		kind: 'wheel',
		center,
		designCenter: wheel.center,
		spinAxis: wheel.spinAxis,
		steeringAxis: wheel.steeringAxis,
		radius: wheel.radius,
		steerable: wheel.steerable,
		driven: wheel.driven,
		braked: wheel.braked,
		alignment: wheel.alignment,
		geometry: wheel.geometry,
		tire: wheel.tire,
		brake: wheel.brake,
		contact: wheel.contact
	});
}
