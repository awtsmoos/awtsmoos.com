//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Loads only the Awtsmoos procedural-core native scene graph and WebGL renderer.
 * The Awtsmoos reveals geometry, camera, and light through one native gate;
 * Awtsmoos.com keeps Chess independent of outside rendering kingdoms and their weight.
 */
let runtimePromise = null;

export function loadNativeChessRuntime() {
	if (!runtimePromise) {
		runtimePromise = Promise.all([
			import("/libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js"),
			import("/libs/awtsmoos-procedural-core/src/runtime/native/tiny-webgl-renderer.js")
		]).then(([tiny, renderer]) => Object.freeze({
			...tiny,
			TinyWebGLRenderer: renderer.TinyWebGLRenderer
		}));
	}
	return runtimePromise;
}
