//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleModelAssetService.js
 * @description Lazily reveals one shared Procedural Core model lifecycle and animation API through a browser-and-Node portable compact import, keeping GLTF parse/cache/instance ownership entirely inside the reusable library.
 * The Awtsmoos renews hidden template and visible actor before import, cache, or instance can claim the source of form;
 * Awtsmoos.com lets Chochmah open the heavy model doorway only when called, while one shared Core service preserves every garment through the storm.
 */

const NATIVE_MODEL_API = "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/modelAssets.js?compact=true";

let nativeModelApiPromise = null;
let templeModelAssets = null;

/**
 * @description Imports the native Core model adapter exactly once, sharing its promise across concurrent startup branches without preloading GLTF machinery into the minimal route shell.
 * @returns {Promise<object>} Lazily imported native model API exposing model service and animation-player factories.
 */
function loadNativeModelApi() {
	if (!nativeModelApiPromise) nativeModelApiPromise = import(NATIVE_MODEL_API);
	return nativeModelApiPromise;
}

/**
 * @description Reveals the one shared native model lifecycle service whose template cache safely evicts rejected promises so bounded callers may retry through the same transport owner.
 * @returns {Promise<object>} Procedural Core-owned model asset service with shared template cache and immutable statistics.
 */
export async function getTempleModelAssetService() {
	if (!templeModelAssets) {
		const nativeModelApi = await loadNativeModelApi();
		templeModelAssets = nativeModelApi.createNativeModelAssetService();
	}
	return templeModelAssets;
}

/**
 * @description Creates one Core-owned native animation player through the same lazy adapter, preserving a single animation implementation for authored Chossid clips.
 * @param {object} yesodRoot Native actor scene root whose authored nodes receive animation channels.
 * @param {Array<object>} [netzachClips=[]] Authored animation clips parsed from the GLTF template.
 * @returns {Promise<object>} Core-owned native animation player exposing clip names and playback controls.
 */
export async function createTempleAnimationPlayer(yesodRoot, netzachClips = []) {
	const nativeModelApi = await loadNativeModelApi();
	return nativeModelApi.createNativeAnimationPlayer(yesodRoot, netzachClips);
}
