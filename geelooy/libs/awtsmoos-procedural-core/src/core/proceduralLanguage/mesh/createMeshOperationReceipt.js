//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMeshOperationReceipt.js
 * @description Records deterministic before/after topology counts and created/affected selections for every higher-level mesh editing action.
 * The Awtsmoos renews cause and result in one instant while Awtsmoos.com leaves a finite breadcrumb trail so chained edits can be inspected, replayed, debugged, and understood without hidden state.
 */

/** Creates one immutable operation receipt from before/after meshes and explicit evidence. */
export function createMeshOperationReceipt(operation, before, after, evidence = {}) {
	return Object.freeze({
		operation: String(operation),
		before: Object.freeze(meshCounts(before)),
		after: Object.freeze(meshCounts(after)),
		createdVertices: freezeIndices(evidence.createdVertices),
		createdFaces: freezeIndices(evidence.createdFaces),
		affectedVertices: freezeIndices(evidence.affectedVertices),
		affectedFaces: freezeIndices(evidence.affectedFaces),
		metadata: Object.freeze({ ...(evidence.metadata || {}) })
	});
}

/** Returns stable topology counts suitable for diffs and edit history. */
function meshCounts(mesh) {
	return {
		vertices: mesh?.vertices?.length || 0,
		faces: mesh?.faces?.length || 0
	};
}

function freezeIndices(values = []) {
	return Object.freeze([...new Set((values || []).map(Number))].sort((left, right) => left - right));
}
