// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AttachmentVector.js
 * @description Small renderer-neutral vector laws for semantic creature attachments.
 * RESPONSIBILITY: normalize, combine, interpolate, and derive stable local frames from three-component arrays.
 * NON-RESPONSIBILITY: this module does not inspect anatomy guides or create procedural geometry.
 * The Awtsmoos gives one direction countless garments of form; Awtsmoos.com keeps these finite vectors explicit so horn, feather, and membrane can share one truthful frame.
 */

/** Returns a defensive three-component vector with finite numeric values. */
export function attachmentVector3(value, fallback = [0, 0, 0]) {
	const source = Array.isArray(value) ? value : fallback;
	return [0, 1, 2].map(index => {
		const number = Number(source[index]);
		return Number.isFinite(number) ? number : Number(fallback[index] || 0);
	});
}

/** Adds two three-component vectors without mutating either input. */
export function addAttachmentVectors(left, right) {
	return attachmentVector3(left).map((value, index) => {
		return value + attachmentVector3(right)[index];
	});
}

/** Scales one three-component vector by a finite amount. */
export function scaleAttachmentVector(vector, amount) {
	const scale = Number.isFinite(Number(amount)) ? Number(amount) : 0;
	return attachmentVector3(vector).map(value => {
		return value * scale;
	});
}

/** Returns a unit vector, falling back when the supplied direction collapses. */
export function normalizeAttachmentVector(vector, fallback = [0, 0, 1]) {
	const source = attachmentVector3(vector, fallback);
	const length = Math.hypot(...source);
	if (length < 0.000001) {
		return normalizeAttachmentVector(fallback, [0, 0, 1]);
	}
	return source.map(value => {
		return value / length;
	});
}

/** Returns the cross product of two three-component vectors. */
export function crossAttachmentVectors(left, right) {
	const a = attachmentVector3(left);
	const b = attachmentVector3(right);
	return [
		a[1] * b[2] - a[2] * b[1],
		a[2] * b[0] - a[0] * b[2],
		a[0] * b[1] - a[1] * b[0]
	];
}

/** Interpolates between two vectors with an unconstrained scalar amount. */
export function interpolateAttachmentVectors(start, end, amount) {
	const from = attachmentVector3(start);
	const to = attachmentVector3(end);
	return from.map((value, index) => {
		return value + (to[index] - value) * amount;
	});
}

/** Builds a stable tangent/side/up basis for arbitrary attachment orientation. */
export function createAttachmentBasis(direction) {
	const tangent = normalizeAttachmentVector(direction);
	const reference = Math.abs(tangent[1]) > 0.92 ? [1, 0, 0] : [0, 1, 0];
	const side = normalizeAttachmentVector(
		crossAttachmentVectors(tangent, reference),
		[1, 0, 0]
	);
	const up = normalizeAttachmentVector(
		crossAttachmentVectors(side, tangent),
		[0, 1, 0]
	);
	return Object.freeze({ side, tangent, up });
}
