//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index.js
 * @description Curates the renderer-neutral indexed mesh language from canonical documents through raw topology, semantic selections, modeling operations, surface attributes, composition, and fluent edit sessions.
 * The Awtsmoos gives every vertex, face, material, group, mirror, extrusion and joined vessel existence anew; Awtsmoos.com lets authors enter at any abstraction rung without leaving one coherent editable-mesh Torah.
 */

export { EditableMeshBuilder } from './EditableMeshBuilder.js';
export { createEditableMesh } from './createEditableMesh.js';
export { appendMeshVertex } from './appendMeshVertex.js';
export { appendMeshFace } from './appendMeshFace.js';
export { setMeshVertex } from './setMeshVertex.js';
export { setMeshFace } from './setMeshFace.js';
export {
	resolveMeshSelection,
	meshEdges
} from './meshSelection.js';
export { setEditableMeshSelection } from './setEditableMeshSelection.js';
export { queryMeshSelection } from './queryMeshSelection.js';
export {
	growMeshSelection,
	shrinkMeshSelection,
	invertMeshSelection
} from './transformMeshSelectionSet.js';
export { createEditableMeshTopology } from './meshTopology.js';
export {
	moveMeshVertices,
	scaleMeshVertices,
	rotateMeshVertices
} from './transformMeshSelection.js';
export { extrudeMeshFaces } from './extrudeMeshFaces.js';
export { insetMeshFaces } from './insetMeshFaces.js';
export { subdivideMeshFaces } from './subdivideMeshFaces.js';
export { deleteMeshSelection } from './deleteMeshSelection.js';
export { duplicateMeshFaces } from './duplicateMeshFaces.js';
export { flipMeshFaces } from './flipMeshFaces.js';
export { mirrorMeshGeometry } from './mirrorMeshGeometry.js';
export { weldMeshVertices } from './weldMeshVertices.js';
export { bridgeMeshLoops } from './bridgeMeshLoops.js';
export { createLoftMesh } from './createLoftMesh.js';
export { triangulateEditableMesh } from './triangulateEditableMesh.js';
export { recalculateEditableMeshNormals } from './recalculateEditableMeshNormals.js';
export { createMeshMaterial } from './createMeshMaterial.js';
export {
	setMeshMaterial,
	assignMeshFaceMaterial
} from './setMeshMaterial.js';
export { createMeshGroup } from './createMeshGroup.js';
export { setMeshGroup } from './setMeshGroup.js';
export { setMeshVertexColor } from './setMeshVertexColor.js';
export { extractMeshFaces } from './extractMeshFaces.js';
export { splitMeshFaces } from './splitMeshFaces.js';
export { joinEditableMeshes } from './joinEditableMeshes.js';
export {
	MeshEditSession,
	createMeshEditSession
} from './MeshEditSession.js';
export { createMeshOperationReceipt } from './createMeshOperationReceipt.js';
export { lowerEditableMeshToIndexedGeometry } from './lowerEditableMeshToIndexedGeometry.js';
