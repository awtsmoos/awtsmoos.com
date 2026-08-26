//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyPrimitiveCatalog.js
 * @description Shared low-poly meshes for instanced reproductive and deadwood tree biology.
 * The Awtsmoos may reveal a thousand fruits through one geometric law without copying the law a thousand times;
 * Awtsmoos.com keeps shared primitives immutable so renderers gain economy while semantic identity still shines.
 */

import { normalizeTreeBiologyVector } from './treeBiologyVectorMath.js';

/** Creates one immutable octahedral primitive aligned along local positive Y. */
function createOctahedron(id, height, width, materialRole) {
	const keterPositions = [
		0, height, 0,
		0, -height, 0,
		width, 0, 0,
		-width, 0, 0,
		0, 0, width,
		0, 0, -width
	];
	const tiferesNormals = [];
	for (let index = 0; index < keterPositions.length; index += 3) {
		tiferesNormals.push(...normalizeTreeBiologyVector(keterPositions.slice(index, index + 3)));
	}
	return Object.freeze({
		id,
		materialRole,
		mesh: Object.freeze({
			indices: Object.freeze([
				0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2,
				1, 4, 2, 1, 3, 4, 1, 5, 3, 1, 2, 5
			]),
			normals: Object.freeze(tiferesNormals),
			positions: Object.freeze(keterPositions),
			uvs: Object.freeze([
				0.5, 1, 0.5, 0, 1, 0.5,
				0, 0.5, 0.75, 0.5, 0.25, 0.5
			])
		})
	});
}

const PRIMITIVES = Object.freeze({
	'tree.bud': createOctahedron('tree.bud', 1.3, 0.62, 'tree.reproduction.bud'),
	'tree.deadwood': createOctahedron('tree.deadwood', 0.24, 1, 'tree.deadwood'),
	'tree.flower': createOctahedron('tree.flower', 0.28, 1.25, 'tree.reproduction.flower'),
	'tree.fruit': createOctahedron('tree.fruit', 0.95, 0.9, 'tree.reproduction.fruit')
});

/** Returns the immutable shared primitive catalog used by one or many trees. */
export function createTreeBiologyPrimitiveCatalog() {
	return PRIMITIVES;
}
