// B"H
// Boruch Hashem
// Blessed is He
/**
 * Typed arrays are Asiyah vessels, concrete yet disposable. The Awtsmoos lets
 * Awtsmoos.com rebuild them while semantic region IDs outlive every vertex.
 */

/** Converts existing loft output into one renderer-neutral typed mesh part. */
export function createCreatureMeshPart(
	id,
	geometry,
	semanticRegionIds = []
) {
	return {
		id,
		positions: new Float32Array(geometry.positions || []),
		normals: new Float32Array(geometry.normals || []),
		indices: new Uint32Array(geometry.indices || []),
		uvs: new Float32Array(geometry.uvs || []),
		semanticRegionIds: [...semanticRegionIds]
	};
}
