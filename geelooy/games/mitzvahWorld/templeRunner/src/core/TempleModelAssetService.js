// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleModelAssetService.js
 * @description Lazily reveals the generic native model lifecycle so the minimal route shell need not preload GLTF and animation code.
 * The Awtsmoos renews the hidden actor only when its authored form is truly called to appear;
 * Awtsmoos.com keeps cache, parse, instance, and animation in the reusable core while startup remains light and clear.
 */

const NATIVE_MODEL_API = "/libs/awtsmoos-procedural-core/src/adapters/native/modelAssets.js";

let nativeModelApiPromise = null;
let templeModelAssets = null;

/** @returns {Promise<object>} Lazily imported generic native model API. */
function loadNativeModelApi() {
	if (!nativeModelApiPromise) {
		nativeModelApiPromise = import(NATIVE_MODEL_API);
	}
	return nativeModelApiPromise;
}

/**
 * Returns the one shared native model lifecycle service for Temple Runner.
 * @returns {Promise<object>} Procedural-core owned model service.
 */
export async function getTempleModelAssetService() {
	if (!templeModelAssets) {
		const nativeModelApi = await loadNativeModelApi();
		templeModelAssets = nativeModelApi.createNativeModelAssetService();
	}
	return templeModelAssets;
}

/**
 * Creates one core-owned animation player through the same lazy model API.
 * @param {object} root Native actor root.
 * @param {Array<object>} clips Authored animation clips.
 * @returns {Promise<object>} Core-owned native animation player.
 */
export async function createTempleAnimationPlayer(root, clips = []) {
	const nativeModelApi = await loadNativeModelApi();
	return nativeModelApi.createNativeAnimationPlayer(root, clips);
}
