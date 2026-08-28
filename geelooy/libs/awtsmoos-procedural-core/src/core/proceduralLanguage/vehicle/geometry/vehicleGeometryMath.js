//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vehicleGeometryMath.js
 * @description Supplies small deterministic vector laws and perpendicular frames for vehicle tubes, axles, spokes, drawbars, and frame members.
 * The Awtsmoos precedes axis and angle while Awtsmoos.com lets every finite tube find a stable local circle without borrowing renderer mathematics.
 */

export function addVehicleVector(first, second) {
	return [first[0] + second[0], first[1] + second[1], first[2] + second[2]];
}

export function subtractVehicleVector(first, second) {
	return [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
}

export function scaleVehicleVector(vector, scalar) {
	return [vector[0] * scalar, vector[1] * scalar, vector[2] * scalar];
}

export function crossVehicleVector(first, second) {
	return [
		first[1] * second[2] - first[2] * second[1],
		first[2] * second[0] - first[0] * second[2],
		first[0] * second[1] - first[1] * second[0]
	];
}

export function normalizeVehicleVector(vector, fallback = [1, 0, 0]) {
	const length = Math.hypot(vector[0], vector[1], vector[2]);
	if (length <= 1e-12) {
		return [...fallback];
	}
	return scaleVehicleVector(vector, 1 / length);
}

/** Returns two deterministic unit vectors perpendicular to the supplied axis. */
export function vehiclePerpendicularFrame(axis) {
	const direction = normalizeVehicleVector(axis);
	const helper = Math.abs(direction[2]) < 0.9
		? [0, 0, 1]
		: [0, 1, 0];
	const first = normalizeVehicleVector(crossVehicleVector(direction, helper), [0, 1, 0]);
	const second = normalizeVehicleVector(crossVehicleVector(direction, first), [0, 0, 1]);
	return {
		direction,
		first,
		second
	};
}
