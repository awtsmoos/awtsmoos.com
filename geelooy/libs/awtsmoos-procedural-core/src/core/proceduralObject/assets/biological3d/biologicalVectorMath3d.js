// B"H
// Boruch Hashem
// Blessed is He
/** Finite vectors become the quiet axes through which biological form enters space. */

export function biologicalVector3d(value, fallback = [0, 0, 0], label = "Biological vector") {
	const source = value ?? fallback;
	if (!Array.isArray(source) || source.length !== 3) {
		throw new TypeError(`${label} must contain three values.`);
	}
	const vector = source.map(Number);
	if (vector.some(component => !Number.isFinite(component))) {
		throw new TypeError(`${label} components must be finite.`);
	}
	return Object.freeze(vector);
}

export function biologicalAdd3d(left, right) {
	return Object.freeze(left.map((value, axis) => value + right[axis]));
}

export function biologicalScale3d(vector, scale) {
	const amount = Number(scale);
	if (!Number.isFinite(amount)) throw new TypeError("Biological scale must be finite.");
	return Object.freeze(vector.map(value => value * amount));
}

export function biologicalLength3d(vector) {
	return Math.hypot(...vector);
}

export function biologicalNormalize3d(vector, fallback = [0, 1, 0]) {
	const length = biologicalLength3d(vector);
	return length > 1e-12
		? Object.freeze(vector.map(value => value / length))
		: biologicalVector3d(fallback);
}

export function biologicalCross3d(left, right) {
	return Object.freeze([
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	]);
}

export function biologicalFrame3d(input = {}) {
	const position = biologicalVector3d(input.position, [0, 0, 0], "Frame position");
	const direction = biologicalNormalize3d(
		biologicalVector3d(input.direction, [0, 1, 0], "Frame direction")
	);
	let up = biologicalNormalize3d(
		biologicalVector3d(input.up, [0, 0, 1], "Frame up")
	);
	if (biologicalLength3d(biologicalCross3d(direction, up)) <= 1e-8) {
		up = Math.abs(direction[1]) < 0.9
			? Object.freeze([0, 1, 0])
			: Object.freeze([1, 0, 0]);
	}
	const right = biologicalNormalize3d(biologicalCross3d(direction, up));
	const correctedUp = biologicalNormalize3d(biologicalCross3d(right, direction));
	return Object.freeze({ position, direction, up: correctedUp, right });
}

export function biologicalRotateAroundAxis3d(vector, axisInput, angleInput) {
	const axis = biologicalNormalize3d(axisInput);
	const angle = Number(angleInput);
	if (!Number.isFinite(angle)) throw new TypeError("Biological rotation angle must be finite.");
	const cosine = Math.cos(angle);
	const sine = Math.sin(angle);
	const dot = vector.reduce((sum, value, index) => sum + value * axis[index], 0);
	const cross = biologicalCross3d(axis, vector);
	return Object.freeze(vector.map((value, index) => (
		value * cosine + cross[index] * sine + axis[index] * dot * (1 - cosine)
	)));
}
