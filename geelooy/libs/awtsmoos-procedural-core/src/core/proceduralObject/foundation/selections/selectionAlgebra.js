// B"H

import { createSelectionArtifact } from "./createSelectionArtifact.js";

function assertCompatible(left, right) {
	const sameTarget = left.target.artifactId === right.target.artifactId
		&& left.target.revision === right.target.revision
		&& left.target.contentHash === right.target.contentHash;
	if (!sameTarget || left.domain !== right.domain) {
		throw new Error("Selection algebra requires the same target revision and domain.");
	}
}

function resultSelection(left, elementIds, operation, weights = null) {
	return createSelectionArtifact({
		target: left.target,
		domain: left.domain,
		elementIds,
		weights,
		provenance: { operation, inputs: [left.id] }
	});
}

/** Returns the deterministic union of two compatible selections. */
export function unionSelections(left, right) {
	assertCompatible(left, right);
	return createSelectionArtifact({
		target: left.target,
		domain: left.domain,
		elementIds: [...left.elementIds, ...right.elementIds],
		provenance: { operation: "union", inputs: [left.id, right.id] }
	});
}

/** Returns the deterministic intersection of two compatible selections. */
export function intersectSelections(left, right) {
	assertCompatible(left, right);
	const rightIds = new Set(right.elementIds);
	return createSelectionArtifact({
		target: left.target,
		domain: left.domain,
		elementIds: left.elementIds.filter(id => rightIds.has(id)),
		provenance: { operation: "intersection", inputs: [left.id, right.id] }
	});
}

/** Returns elements selected by left but not by right. */
export function subtractSelections(left, right) {
	assertCompatible(left, right);
	const rightIds = new Set(right.elementIds);
	return createSelectionArtifact({
		target: left.target,
		domain: left.domain,
		elementIds: left.elementIds.filter(id => !rightIds.has(id)),
		provenance: { operation: "difference", inputs: [left.id, right.id] }
	});
}

/** Selects every explicit universe ID not present in the source selection. */
export function complementSelection(selection, universeIds) {
	const selected = new Set(selection.elementIds);
	return resultSelection(
		selection,
		universeIds.filter(id => !selected.has(id)),
		"complement"
	);
}
