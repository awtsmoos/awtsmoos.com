// B"H
// Boruch Hashem
// Blessed is He
/** A solid collider names finite boundary, motion, and material response explicitly. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";
import { createSignedDistanceField } from "../volumes/createSignedDistanceField.js";

function finiteVector3(value, label) {
	if (!Array.isArray(value) || value.length !== 3) {
		throw new TypeError(`${label} must contain three values.`);
	}
	const vector = value.map(Number);
	if (vector.some(component => !Number.isFinite(component))) {
		throw new TypeError(`${label} components must be finite.`);
	}
	return Object.freeze(vector);
}

function unitInterval(value, fallback, label) {
	const number = Number(value ?? fallback);
	if (!Number.isFinite(number)) {
		throw new TypeError(`${label} must be finite.`);
	}
	return Math.max(0, Math.min(1, number));
}

export function createSolidCollider3d(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Solid collider input must be an object.");
	}
	const field = input.field?.schema === "awtsmoos.signed-distance-field"
		? input.field
		: createSignedDistanceField(input.field);
	const velocity = finiteVector3(input.velocity ?? [0, 0, 0], "Collider velocity");
	const restitution = unitInterval(input.restitution, 0, "Collider restitution");
	const friction = unitInterval(input.friction, 0, "Collider friction");
	const margin = Math.max(0, Number(input.margin ?? 0));
	const normalStep = Math.max(1e-9, Number(input.normalStep ?? 1e-4));
	if (![margin, normalStep].every(Number.isFinite)) {
		throw new TypeError("Collider margin and normalStep must be finite.");
	}
	return Object.freeze({
		schema: "awtsmoos.solid-collider-3d",
		id: input.id ?? createStableId("solid.collider.3d", {
			fieldId: field.id,
			velocity,
			restitution,
			friction,
			margin
		}),
		field,
		velocity,
		restitution,
		friction,
		margin,
		normalStep,
		metadata: cloneManifestMetadata(input.metadata ?? {})
	});
}
