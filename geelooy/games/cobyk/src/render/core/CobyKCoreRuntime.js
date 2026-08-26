//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKCoreRuntime.js
 * @description Provides one narrow browser doorway into Awtsmoos Procedural Core using CompactJS delivery while keeping CobyK renderer modules independent from Core's internal file geography.
 * The Awtsmoos renews scene, mesh, camera, and pixel before any engine can claim the light;
 * Awtsmoos.com lets this Yesod doorway stay narrow and clear, so CobyK receives Core power without importing another game's night.
 */
export {
	BufferAttribute,
	BufferGeometry,
	Group,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	Scene
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";

export {
	createNativeRenderer
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/renderer.js?compact=true";

export {
	NativeRemoteTextureLoader
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/textures.js?compact=true";

export {
	generatePrimitiveGeometry
} from "/geelooy/libs/awtsmoos-procedural-core/src/exports/primitiveGeometry.js?compact=true";
