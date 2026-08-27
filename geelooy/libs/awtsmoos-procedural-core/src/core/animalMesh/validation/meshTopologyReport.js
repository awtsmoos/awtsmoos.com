// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function reportMeshPartTopology(part) {
	const edgeCounts = new Map();
	let degenerateFaceCount = 0;

	for (let index = 0; index < part.indices.length; index += 3) {
		const triangle = part.indices.slice(index, index + 3);
		if (new Set(triangle).size < 3) {
			degenerateFaceCount += 1;
		}
		recordEdge(edgeCounts, triangle[0], triangle[1]);
		recordEdge(edgeCounts, triangle[1], triangle[2]);
		recordEdge(edgeCounts, triangle[2], triangle[0]);
	}
	const counts = Array.from(edgeCounts.values());
	return {
		id: part.id,
		vertex_count: part.positions.length / 3,
		triangle_count: part.indices.length / 3,
		open_boundary_count: counts.filter((count) => count === 1).length,
		non_manifold_edge_count: counts.filter((count) => count > 2).length,
		degenerate_face_count: degenerateFaceCount
	};
}

function recordEdge(edgeCounts, left, right) {
	const key = left < right
		? `${left}:${right}`
		: `${right}:${left}`;
	edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
}
