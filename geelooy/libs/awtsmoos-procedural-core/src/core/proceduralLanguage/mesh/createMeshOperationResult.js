//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMeshOperationResult.js
 * @description Wraps an immutable edited mesh with a transparent operation receipt for callers that want evidence while simpler functional APIs may continue returning meshes directly.
 * The Awtsmoos is beyond result and witness while Awtsmoos.com lets both travel together; expert tools can inspect the receipt while simple callers hold the geometry feather.
 */

/** Creates one immutable mesh-operation result envelope. */
export function createMeshOperationResult(mesh, receipt) {
	return Object.freeze({
		mesh,
		receipt
	});
}
