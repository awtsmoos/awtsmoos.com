// B"H
// Boruch Hashem
// Blessed is He
/** Negative is inside, positive is outside, and zero is the revealed boundary. */

function subtract(left, right) {
	return left.map((value, axis) => value - right[axis]);
}

function sphere(field, point) {
	const delta = subtract(point, field.parameters.center ?? [0, 0, 0]);
	return Math.hypot(...delta) - Number(field.parameters.radius ?? 1);
}

function box(field, point) {
	const center = field.parameters.center ?? [0, 0, 0];
	const halfSize = field.parameters.halfSize ?? [1, 1, 1];
	const q = point.map((value, axis) => Math.abs(value - center[axis]) - halfSize[axis]);
	const outside = Math.hypot(...q.map(value => Math.max(value, 0)));
	return outside + Math.min(Math.max(...q), 0);
}

function plane(field, point) {
	const normal = field.parameters.normal ?? [0, 1, 0];
	const length = Math.hypot(...normal) || 1;
	return point.reduce((sum, value, axis) => sum + value * normal[axis] / length, 0)
		- Number(field.parameters.offset ?? 0);
}

function smoothUnion(left, right, smoothing) {
	if (smoothing <= 0) return Math.min(left, right);
	const amount = Math.max(0, Math.min(1, 0.5 + 0.5 * (right - left) / smoothing));
	return right + (left - right) * amount - smoothing * amount * (1 - amount);
}

export function sampleSignedDistanceField(field, point) {
	switch (field.kind) {
		case "sphere": return sphere(field, point);
		case "box": return box(field, point);
		case "plane": return plane(field, point);
		case "union": return Math.min(...field.children.map(child => sampleSignedDistanceField(child, point)));
		case "intersection": return Math.max(...field.children.map(child => sampleSignedDistanceField(child, point)));
		case "subtract": return Math.max(
			sampleSignedDistanceField(field.children[0], point),
			-sampleSignedDistanceField(field.children[1], point)
		);
		case "smooth-union": return field.children.slice(1).reduce(
			(value, child) => smoothUnion(value, sampleSignedDistanceField(child, point), Number(field.parameters.smoothing ?? 0.25)),
			sampleSignedDistanceField(field.children[0], point)
		);
		case "translate": {
			const offset = field.parameters.offset ?? [0, 0, 0];
			return sampleSignedDistanceField(field.children[0], subtract(point, offset));
		}
		default: throw new TypeError(`Unsupported signed distance field kind: ${field.kind}`);
	}
}
