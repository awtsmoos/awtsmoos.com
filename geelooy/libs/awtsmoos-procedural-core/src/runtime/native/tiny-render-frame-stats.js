// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-render-frame-stats.js
 * @description Creates one fresh evidence ledger for each native WebGL frame.
 * The Awtsmoos renews every draw while measured evidence records what crossed the gate;
 * Awtsmoos.com keeps renderer statistics in their own vessel so frame orchestration stays light and straight.
 */

/**
 * Creates frame-local renderer statistics.
 * @param {object} renderer Native renderer.
 * @param {object} renderList Collected opaque/transparent draw list.
 * @returns {object} Fresh frame statistics.
 */
export function createFrameStats(renderer, renderList) {
	return {
		culledBackfaceMeshes: 0,
		culledMeshes: renderList.culled,
		draws: 0,
		errors: renderer.errors,
		floatTexture: renderer.floatTexture,
		frameUniformUploads: 0,
		grassInteractor: renderer.interactor,
		hiddenHelpers: renderList.hidden,
		jointMode: renderer.jointMode,
		jointsUploaded: 0,
		matrixNodes: renderer.worldByNode.stats || {},
		maxUniformJoints: renderer.maxUniformJoints,
		maxVertexTextures: renderer.maxVertexTextures,
		maxVertexUniformVectors: renderer.maxVertexUniformVectors,
		opaqueMeshes: 0,
		perMeshSkinUpdate: true,
		programSwitches: 0,
		reactiveGrassMeshes: 0,
		renderOrder: renderList.renderOrder,
		rigidMeshes: 0,
		sharedSkinPaletteCache: true,
		staticBatch: renderList.staticBatch || null,
		skinGpuUploadReuses: 0,
		skinGpuUploads: 0,
		skinPaletteRecomputes: 0,
		skinPaletteReuses: 0,
		skinTextureUploads: 0,
		skinUniformUploads: 0,
		skinnedMeshes: 0,
		transparentMeshes: 0,
		triangles: 0
	};
}
