// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FleshImplicitField.js
 * @description Evaluates a smooth union of tapered anatomical capsules and derives deterministic sampling bounds.
 * RESPONSIBILITY: answer signed-distance queries for continuous flesh without knowing meshes, bones, species, or renderers.
 * NON-RESPONSIBILITY: this vessel does not create anatomy, polygonize surfaces, bind skin, or animate joints.
 * The Awtsmoos makes many finite vessels reveal one unbroken living envelope;
 * Awtsmoos.com lets distance become the quiet law by which torso and limb meet without a hidden cap or severed shell.
 */

/**
 * Creates a callable signed-distance field and its padded world-space bounds.
 * @param {Array<object>} primitives Tapered flesh capsules from authoritative anatomy.
 * @param {object} options Blend radius and bounds padding controls.
 * @returns {object} Frozen field contract with `sample(point)` and `bounds`.
 */
export function createFleshImplicitField(primitives, options = {}) {
	if (!primitives.length) {
		throw new TypeError('B"H | Continuous flesh requires at least one primitive.');
	}
	const blendRadius = positive(options.blendRadius, 0.035);
	const bounds = createBounds(primitives, positive(options.padding, blendRadius * 2));
	return Object.freeze({
		blendRadius,
		bounds,
		primitives: Object.freeze([...primitives]),
		sample(point) {
			return sampleUnion(point, primitives, blendRadius);
		}
	});
}

/** Evaluates the smooth union of every tapered primitive at one point. */
function sampleUnion(point, primitives, blendRadius) {
	let value = taperedCapsuleDistance(point, primitives[0]);
	for (let index = 1; index < primitives.length; index += 1) {
		value = smoothMinimum(
			value,
			taperedCapsuleDistance(point, primitives[index]),
			blendRadius
		);
	}
	return value;
}

/** Computes an approximate signed distance to a linearly tapered capsule. */
function taperedCapsuleDistance(point, primitive) {
	const axis = subtract(primitive.end, primitive.start);
	const lengthSquared = dot(axis, axis);
	const offset = subtract(point, primitive.start);
	const amount = lengthSquared > 1e-12
		? clamp(dot(offset, axis) / lengthSquared, 0, 1)
		: 0;
	const center = primitive.start.map((value, index) => {
		return value + axis[index] * amount;
	});
	const radius = mix(primitive.radiusStart, primitive.radiusEnd, amount);
	return length(subtract(point, center)) - radius;
}

/** Smoothly combines two signed distances while preserving a bounded junction blend. */
function smoothMinimum(left, right, radius) {
	if (radius <= 1e-8) {
		return Math.min(left, right);
	}
	const amount = clamp(0.5 + 0.5 * (right - left) / radius, 0, 1);
	return mix(right, left, amount) - radius * amount * (1 - amount);
}

/** Derives axis-aligned bounds from primitive endpoints and maximum radii. */
function createBounds(primitives, padding) {
	const minimum = [Infinity, Infinity, Infinity];
	const maximum = [-Infinity, -Infinity, -Infinity];
	for (const primitive of primitives) {
		const radius = Math.max(primitive.radiusStart, primitive.radiusEnd) + padding;
		for (const point of [primitive.start, primitive.end]) {
			for (let axis = 0; axis < 3; axis += 1) {
				minimum[axis] = Math.min(minimum[axis], point[axis] - radius);
				maximum[axis] = Math.max(maximum[axis], point[axis] + radius);
			}
		}
	}
	return Object.freeze({
		minimum: Object.freeze(minimum),
		maximum: Object.freeze(maximum)
	});
}

/** Lightweight vector helpers keep this field independent from renderer math types. */
function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

/** Returns the Euclidean vector length. */
function length(vector) {
	return Math.sqrt(dot(vector, vector));
}

/** Returns the scalar dot product. */
function dot(left, right) {
	return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

/** Returns a linear interpolation. */
function mix(left, right, amount) {
	return left + (right - left) * amount;
}

/** Clamps one value into a closed interval. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

/** Returns a positive finite number or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
