//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMeshGroup.js
 * @description Creates one semantic group over indexed mesh vertices, edges, and faces without splitting geometry into scene objects or duplicate meshes.
 * The Awtsmoos joins many points in one vessel while Awtsmoos.com lets a door, hull plate, wing, train bogie, or painted panel keep its name inside the same mesh flame.
 */

/** Creates one immutable JSON-safe semantic mesh-group descriptor. */
export function createMeshGroup(input = {}) {
	return Object.freeze({
		id: String(input.id || 'group'),
		vertices: freezeIndices(input.vertices),
		edges: freezeIndices(input.edges),
		faces: freezeIndices(input.faces),
		material: input.material ?? null,
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}

/** Normalizes one deterministic sorted index set. */
function freezeIndices(values = []) {
	const indices = [...new Set((values || []).map(Number))]
		.filter(Number.isInteger)
		.sort((left, right) => left - right);
	return Object.freeze(indices);
}
