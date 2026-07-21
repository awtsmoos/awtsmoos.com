// B"H
// Boruch Hashem
// Blessed is He
/** Signed distance fields name form before triangles conceal its continuous source. */

import { createStableId } from "../foundation/artifacts/createStableId.js";
import { cloneManifestMetadata } from "../foundation/canonical/cloneManifestMetadata.js";

export const SIGNED_DISTANCE_FIELD_KINDS = Object.freeze([
	"sphere", "box", "plane", "union", "intersection",
	"subtract", "smooth-union", "translate"
]);

export function createSignedDistanceField(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Signed distance field must be an object.");
	}
	if (!SIGNED_DISTANCE_FIELD_KINDS.includes(input.kind)) {
		throw new TypeError(`Unsupported signed distance field kind: ${input.kind}`);
	}
	const children = Object.freeze((input.children ?? []).map(createSignedDistanceField));
	if (["union", "intersection", "smooth-union"].includes(input.kind) && children.length < 2) {
		throw new Error(`${input.kind} requires at least two child fields.`);
	}
	if (input.kind === "subtract" && children.length !== 2) {
		throw new Error("subtract requires exactly two child fields.");
	}
	if (input.kind === "translate" && children.length !== 1) {
		throw new Error("translate requires exactly one child field.");
	}
	const parameters = cloneManifestMetadata(input.parameters ?? {});
	return Object.freeze({
		schema: "awtsmoos.signed-distance-field",
		id: input.id ?? createStableId("sdf", { kind: input.kind, parameters, children }),
		kind: input.kind,
		parameters,
		children
	});
}
