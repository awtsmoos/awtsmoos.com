//B"H
// Boruch Hashem
// Blessed is He
/**
 * Procedural meshes carry positions but no UVs. This vessel drapes a simple
 * box-style planar mapping over any merged mesh so Drive textures have
 * coordinates to land on. Diagonal (x+z, y) projection keeps flat tops
 * (roads) tiling cleanly while giving sides readable grain.
 *
 * B"H — Yaakov 2026-10-13: no more flat colors; every mesh gets UVs.
 */

/**
 * Returns a copy of the mesh with a `uvs` array (2 floats per vertex).
 *
 * @param {object} mesh - Procedural mesh with `positions` (flat xyz array).
 * @param {number} [scale=0.35] - World-units per texture tile.
 * @returns {object} The mesh with `uvs` attached.
 */
export function withBoxUVs(mesh, scale = 0.35) {
	const positions = mesh.positions || [];
	const vertexCount = Math.floor(positions.length / 3);
	const uvs = new Array(vertexCount * 2);
	for (let i = 0; i < vertexCount; i++) {
		const x = positions[i * 3] || 0;
		const y = positions[i * 3 + 1] || 0;
		const z = positions[i * 3 + 2] || 0;
		uvs[i * 2] = (x * 0.7 + z * 0.7) * scale;
		uvs[i * 2 + 1] = y * scale;
	}
	return { ...mesh, uvs };
}
