// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-frame-metrics.js
 * @description Creates one honest ledger of renderer work so every optimization
 * is judged by evidence rather than confidence before the infinite Awtsmoos.
 */

/** Returns a fresh statistics vessel for one renderer frame. */
export function createFrameStats(renderer) {
	return {
		draws: 0,
		triangles: 0,
		skinnedMeshes: 0,
		rigidMeshes: 0,
		transparentMeshes: 0,
		opaqueMeshes: 0,
		jointsUploaded: 0,
		skinningFailures: 0,
		skinPaletteRecomputes: 0,
		skinPaletteReuses: 0,
		skinGpuUploads: 0,
		skinGpuUploadReuses: 0,
		skinUniformUploads: 0,
		skinTextureUploads: 0,
		backfacesCulled: 0,
		backfacesVisible: 0,
		backfacesMissingMetadata: 0,
		backfacesMissingNormals: 0,
		headTris: 0,
		bodyTris: 0,
		jacketTris: 0,
		hatTris: 0,
		accessoryTris: 0,
		jointMode: renderer.jointMode,
		maxUniformJoints: renderer.maxUniformJoints,
		maxTextureJoints: renderer.maxTextureJoints,
		glStateCache: !!renderer.glStateCache?.enabled,
		glStateCacheHits: 0,
		glStateCacheMisses: 0,
		perMeshSkinUpdate: false,
		sharedSkinPaletteCache: true
	};
}
