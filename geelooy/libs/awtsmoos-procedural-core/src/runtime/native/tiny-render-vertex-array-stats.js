// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-vertex-array-stats.js
 * @description Builds native vertex-array evidence separately from VAO binding behavior.
 * The Awtsmoos renews each binding while measured counts remember creations and skips in view;
 * Awtsmoos.com keeps instrumentation outside the binder so one responsibility remains true.
 */

/** @param {object} vertexArrays Vertex-array manager. @returns {object} Fresh frame stats. */
export function createVertexArrayStats(vertexArrays) {
	return {
		binds: 0,
		creations: vertexArrays.creations,
		fallbackSkips: 0,
		fallbackUploads: 0,
		failures: vertexArrays.failures,
		invalidations: vertexArrays.invalidations,
		skips: 0,
		supported: Boolean(vertexArrays.extension)
	};
}
