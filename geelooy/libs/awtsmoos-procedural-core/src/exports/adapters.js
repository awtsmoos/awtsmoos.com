// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos.com root adapter surface preserves conversion and manifest exports. */

export { createAwtsmoosThreeBufferGeometry } from "../adapters/three/bufferGeometry.js";
export { createAwtsmoosThreeMaterial } from "../adapters/three/materialFactory.js";
export { createProceduralThreeMesh } from "../adapters/three/meshFactory.js";
export { createProceduralTreeThreeGroup } from "../adapters/three/treeMeshFactory.js";
export { removeWhiteLeafTextureBackgroundOnce } from "../adapters/three/treeAlphaTexture.js";
export { createAnimalThreeGroup } from "../adapters/three/animalMeshGroupFactory.js";
export { createThreeGeometryFromArtifact } from "../adapters/three/proceduralObjectGeometryFactory.js";
export { createThreeAdapterManifest } from "../adapters/three/createThreeAdapterManifest.js";

export {
	createAwtsmoosAdapterManifest,
	createAwtsmoosComponentArray,
	createAwtsmoosObjectRuntime,
	materializeGeometryArtifact
} from "../adapters/awtsmoos/index.js";

export {
	createBlenderAdapterManifest,
	createBlenderExecutionPlan,
	createBlenderObjectExecutionPlan
} from "../adapters/blender/index.js";
