//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshEditSessionEvidence.js
 * @description Keeps fluent-session query detection and created-topology evidence inference outside the session state holder so editor growth never turns one base class into a monolith.
 * The Awtsmoos renews every edit and every witness while Awtsmoos.com lets the receipt law live in a small vessel; state, topology, and evidence remain separate yet sing together.
 */

/** Returns whether one selection input is a JSON-safe semantic query object. */
export function isMeshEditSelectionQuery(value) {
	return Boolean(
		value
		&& typeof value === 'object'
		&& !Array.isArray(value)
	);
}

/** Adds deterministic created vertex/face ranges when an operation grows topology. */
export function inferMeshEditCreatedEvidence(before, after, evidence = {}) {
	return {
		...evidence,
		createdVertices: evidence.createdVertices || meshIndexRange(
			before.vertices.length,
			after.vertices.length
		),
		createdFaces: evidence.createdFaces || meshIndexRange(
			before.faces.length,
			after.faces.length
		)
	};
}

/** Returns one contiguous index range from the old topology count to the new count. */
function meshIndexRange(start, end) {
	return Array.from(
		{ length: Math.max(0, end - start) },
		(_, index) => start + index
	);
}
