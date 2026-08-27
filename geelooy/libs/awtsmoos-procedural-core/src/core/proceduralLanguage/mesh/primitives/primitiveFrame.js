//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primitiveFrame.js
 * @description Creates a stable perpendicular frame around any finite direction for tubes, cylinders, cones, panels, rotors, masts, struts, thrusters, and future sweep laws.
 * The Awtsmoos is beyond axis and plane while Awtsmoos.com lets one direction receive two perpendicular companions so geometry may turn without renderer-owned matrices in the rain.
 */

import { meshPrimitiveVector3 } from './meshPrimitiveValues.js';

export function createPrimitiveFrame(directionInput = [0, 1, 0]) {
	const direction = normalize(meshPrimitiveVector3(directionInput, [0, 1, 0], 'primitive direction'));
	const helper = Math.abs(direction[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
	const first = normalize(cross(direction, helper));
	const second = normalize(cross(direction, first));
	return { direction, first, second };
}

export function primitivePointAlongFrame(origin, frame, axial, first, second) {
	return [0, 1, 2].map(axis => {
		return origin[axis]
			+ frame.direction[axis] * axial
			+ frame.first[axis] * first
			+ frame.second[axis] * second;
	});
}

export function primitiveVectorBetween(start, end) {
	return end.map((value, axis) => value - start[axis]);
}

export function primitiveMidpoint(start, end) {
	return start.map((value, axis) => (value + end[axis]) / 2);
}

export function primitiveVectorLength(vector) {
	return Math.hypot(...vector);
}

function normalize(vector) {
	const length = primitiveVectorLength(vector) || 1;
	return vector.map(value => value / length);
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}
