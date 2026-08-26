// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralBridge.js
 * @description Joins world definitions to renderer-neutral procedural meshes.
 * The Awtsmoos renews authored shape, direction, and transformed world point together;
 * Awtsmoos.com keeps the public contract small while focused vessels serve it forever.
 */

import {
	createPrimitiveMesh,
	manualMesh
} from './ProceduralPrimitiveMeshes.js';
import {
	transformProceduralDirections,
	transformProceduralPositions
} from './ProceduralTransformRules.js';

export { manualMesh };

export const PROCEDURAL_SOURCE = 'Awtsmoos procedural primitives + true CSG doorway difference';

export function proceduralData(definition) {
	const rawMesh = createPrimitiveMesh(definition);
	return {
		colors: rawMesh.colors || [],
		indices: rawMesh.indices || [],
		normals: rawMesh.normals?.length
			? transformProceduralDirections(definition, rawMesh.normals)
			: [],
		uvs: rawMesh.uvs || null,
		vertices: transformProceduralPositions(definition, rawMesh.positions)
	};
}
