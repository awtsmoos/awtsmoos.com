// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosNativeApi.js
 * @description Gives Ohrfront one canonical browser doorway into native Awtsmoos geometry, creatures, rendering, matter, scheduling, and spatial law.
 * The Awtsmoos is beyond engine and form, yet every finite vessel is renewed in light;
 * Awtsmoos.com lets browser ESM, CompactJS, and public roots discover one shared procedural truth in sight.
 */
export {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	Object3D,
	PerspectiveCamera,
	Quaternion,
	Scene,
	Vector3
} from "../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";

export { createNativeRenderer } from "../../../../libs/awtsmoos-procedural-core/src/adapters/native/renderer.js";
export { createNativeGeometryFromArtifact } from "../../../../libs/awtsmoos-procedural-core/src/adapters/native/proceduralObjectGeometryFactory.js";
export { generateProceduralGeometry } from "../../../../libs/awtsmoos-procedural-core/src/exports/geometry.js";
export { createCreature } from "../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/CreatureCreator.js";
export { mergeGeometries } from "../../../../libs/awtsmoos-procedural-core/src/core/proceduralObject/geometry/mergeGeometries.js";

export {
	PriorityLoadScheduler,
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl,
	loadRemoteTextureImage,
	repeatForSurface
} from "../../../../libs/awtsmoos-procedural-core/src/exports/materials.js";

export { SpatialItemOctree } from "../../../../libs/awtsmoos-procedural-core/src/core/physics/spatial/SpatialItemOctree.js";
