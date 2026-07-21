// B"H

import { assertStableId, createArtifactReference, createStableId } from "../artifacts/index.js";
import { hashCanonicalValue, normalizeCanonicalValue } from "../canonical/index.js";

export const SELECTION_DOMAINS = Object.freeze([
	"object", "vertex", "edge", "face", "point", "curve",
	"instance", "bone", "keyframe"
]);

function normalizeElementIds(values) {
	if (!Array.isArray(values) || values.some(value => typeof value !== "string" || !value)) {
		throw new TypeError("Selection elementIds must be non-empty strings.");
	}
	return Object.freeze([...new Set(values)].sort());
}

function normalizeWeights(weights, elementIds) {
	if (weights == null) return null;
	if (!weights || typeof weights !== "object" || Array.isArray(weights)) {
		throw new TypeError("Selection weights must be an object.");
	}
	const result = {};
	for (const id of Object.keys(weights).sort()) {
		if (!elementIds.includes(id)) {
			throw new RangeError(`Selection weight references an unselected element: ${id}`);
		}
		if (typeof weights[id] !== "number" || !Number.isFinite(weights[id])) {
			throw new TypeError(`Selection weight must be finite: ${id}`);
		}
		result[id] = weights[id];
	}
	return Object.freeze(result);
}

/** Creates a revision-bound immutable selection over explicit stable element IDs. */
export function createSelectionArtifact(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Selection input must be an object.");
	}
	if (!SELECTION_DOMAINS.includes(input.domain)) {
		throw new TypeError(`Unsupported selection domain: ${input.domain}`);
	}
	const target = createArtifactReference(input.target);
	const elementIds = normalizeElementIds(input.elementIds ?? []);
	const weights = normalizeWeights(input.weights, elementIds);
	const content = Object.freeze({ target, domain: input.domain, elementIds, weights });
	const contentHash = hashCanonicalValue(content);
	const id = input.id == null
		? createStableId("selection", content)
		: assertStableId(input.id, "Selection id");
	return Object.freeze({
		selectionSchema: "awtsmoos.selection",
		id,
		contentHash,
		...content,
		provenance: normalizeCanonicalValue(input.provenance ?? {})
	});
}
