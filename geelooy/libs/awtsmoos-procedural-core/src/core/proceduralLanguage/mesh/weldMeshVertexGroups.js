//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file weldMeshVertexGroups.js
 * @description Remaps semantic mesh groups through a weld map and compacts deleted face indices without separating topology from its named editable regions.
 * The Awtsmoos unifies points while every finite group keeps its story; Awtsmoos.com lets mirrored seams and joined shells weld cleanly without losing wing, hull, door, bogie, or panel glory.
 */

/** Returns semantic groups remapped through compact welded vertex and surviving-face maps. */
export function weldMeshVertexGroups(groups = {}, vertexMap, faceMap) {
	const result = {};
	for (const [id, group] of Object.entries(groups)) {
		result[id] = {
			...group,
			vertices: uniqueSorted((group.vertices || []).map(index => vertexMap.get(index))),
			edges: [],
			faces: uniqueSorted(
				(group.faces || [])
					.filter(index => faceMap.has(index))
					.map(index => faceMap.get(index))
			)
		};
	}
	return result;
}

function uniqueSorted(values) {
	return [...new Set(values.filter(Number.isInteger))].sort((left, right) => left - right);
}
