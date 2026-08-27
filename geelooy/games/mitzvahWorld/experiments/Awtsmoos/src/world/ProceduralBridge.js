//B"H
//Boruch Hashem
//Blessed is He

/**
	* @file ProceduralBridge.js
	* @description Joins world definitions to renderer-neutral procedural meshes.
	* The Awtsmoos renews authored shape and transformed world point together;
	* Awtsmoos.com keeps the public contract small while focused vessels serve it.
	*/

import {
	createPrimitiveMesh,
	manualMesh
} from './ProceduralPrimitiveMeshes.js';
import { transformProceduralPositions } from './ProceduralTransformRules.js';

export { manualMesh };

export const PROCEDURAL_SOURCE = 'Awtsmoos procedural primitives + true CSG doorway difference';

/**
	* Converts a primitive definition into the indexed geometry contract.
	* @param {object} definition authored world primitive definition.
	* @returns {{vertices: object[], indices: number[], colors: number[], uvs: number[] | null}}
	*/
export function proceduralData(definition) {
	const rawMesh = createPrimitiveMesh(definition);
	return {
		vertices: transformProceduralPositions(definition, rawMesh.positions),
		indices: rawMesh.indices || [],
		colors: rawMesh.colors || [],
		uvs: rawMesh.uvs || null
	};
}
