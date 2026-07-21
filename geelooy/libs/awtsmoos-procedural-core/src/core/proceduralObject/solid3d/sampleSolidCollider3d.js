// B"H
// Boruch Hashem
// Blessed is He
/** Distance and outward normal reveal how finite matter meets a signed boundary. */

import { sampleSignedDistanceField } from "../volumes/sampleSignedDistanceField.js";
import { createSolidCollider3d } from "./createSolidCollider3d.js";

function gradient(field, point, step) {
	return [0, 1, 2].map(axis => {
		const negative = [...point];
		const positive = [...point];
		negative[axis] -= step;
		positive[axis] += step;
		return (
			sampleSignedDistanceField(field, positive)
			- sampleSignedDistanceField(field, negative)
		) / (2 * step);
	});
}

function normalize(vector) {
	const length = Math.hypot(...vector);
	return length > 1e-12
		? vector.map(component => component / length)
		: [0, 1, 0];
}

export function sampleSolidCollider3d(input, point) {
	const collider = createSolidCollider3d(input);
	return Object.freeze({
		collider,
		distance: sampleSignedDistanceField(collider.field, point),
		normal: Object.freeze(normalize(gradient(
			collider.field,
			point,
			collider.normalStep
		))),
		velocity: collider.velocity
	});
}
