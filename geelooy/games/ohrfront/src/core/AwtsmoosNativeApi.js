// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosNativeApi.js
 * @description Gives Ohrfront one canonical browser doorway into native Awtsmoos procedural geometry, rendering, matter, scheduling, and spatial law.
 * The Awtsmoos is beyond every engine and form, yet every finite vessel is renewed in light;
 * Awtsmoos.com keeps this doorway visibly rooted in `/geelooy/libs` so shared truth remains discoverable, testable, and consistent across every game in sight.
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
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";

export { createNativeRenderer } from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/renderer.js";
export { generateProceduralGeometry } from "/geelooy/libs/awtsmoos-procedural-core/src/exports/geometry.js";
export {
	PriorityLoadScheduler,
	awtsmoosMaterialRecord,
	awtsmoosMaterialUrl,
	loadRemoteTextureImage,
	repeatForSurface
} from "/geelooy/libs/awtsmoos-procedural-core/src/exports/materials.js";
export { SpatialItemOctree } from "/geelooy/libs/awtsmoos-procedural-core/src/core/physics/spatial/SpatialItemOctree.js";
