// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterVector3.js
 * @description Keeps water-domain vector math finite, normalized, and renderer-neutral.
 * The Awtsmoos renews every direction before motion receives a name; Awtsmoos.com lets these tiny geometric keilim
 * carry nozzle axes, impulses, currents, and wave normals without binding water law to any graphics or physics framework.
 */

/** Returns one finite three-component vector. */
export function waterVector3(input, fallback = [0, 0, 0]) {
	let source = fallback;
	if (Array.isArray(input)) {
		source = input;
	}
	return Object.freeze([
		finiteNumber(source[0], fallback[0] ?? 0),
		finiteNumber(source[1], fallback[1] ?? 0),
		finiteNumber(source[2], fallback[2] ?? 0)
	]);
}

/** Returns Euclidean vector magnitude. */
export function waterVectorLength(vector) {
	return Math.hypot(vector[0], vector[1], vector[2]);
}

/** Returns a finite unit vector, falling back when magnitude vanishes. */
export function normalizeWaterVector3(input, fallback = [0, 1, 0]) {
	const vector = waterVector3(input, fallback);
	const length = waterVectorLength(vector);
	if (length <= 1e-10) {
		return waterVector3(fallback, [0, 1, 0]);
	}
	return Object.freeze(vector.map(value => value / length));
}

/** Adds two vectors. */
export function addWaterVector3(left, right) {
	return Object.freeze(left.map((value, axis) => value + right[axis]));
}

/** Subtracts the second vector from the first. */
export function subtractWaterVector3(left, right) {
	return Object.freeze(left.map((value, axis) => value - right[axis]));
}

/** Scales a vector by one finite scalar. */
export function scaleWaterVector3(vector, scalar) {
	const amount = finiteNumber(scalar, 0);
	return Object.freeze(vector.map(value => value * amount));
}

/** Builds stable perpendicular axes around one normalized direction. */
export function waterDirectionBasis(directionInput) {
	const forward = normalizeWaterVector3(directionInput, [0, -1, 0]);
	let reference = [1, 0, 0];
	if (Math.abs(forward[1]) < 0.9) {
		reference = [0, 1, 0];
	}
	const right = normalizeWaterVector3(cross(forward, reference), [1, 0, 0]);
	const up = normalizeWaterVector3(cross(right, forward), [0, 0, 1]);
	return Object.freeze({
		forward,
		right,
		up
	});
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function finiteNumber(value, fallback) {
	if (Number.isFinite(Number(value))) {
		return Number(value);
	}
	return Number(fallback ?? 0);
}
