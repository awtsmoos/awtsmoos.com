// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file modelAssets.js
 * @description Joins core asset lifecycle to the core-owned native GLTF loader, instancer, and animation player.
 * The Awtsmoos renews one hidden template while many isolated actors may enter the scene;
 * Awtsmoos.com keeps parse, cache, instance, and animation inside the library so games remain lean and clean.
 */

import {
	ModelAssetService,
	ModelTemplateCache
} from "../../core/assets/index.js";
import { TinyAnimationPlayer } from "../../runtime/native/tiny-animation-player.js";
import { instantiateTinyGltf } from "../../runtime/native/tiny-gltf-instance.js";
import { loadTinyGltf } from "../../runtime/native/tiny-gltf-loader.js";

/**
 * Creates a reusable native GLTF model lifecycle service.
 * @param {object} [options] Optional instance decoration controls.
 * @returns {ModelAssetService} Core-owned model asset service.
 */
export function createNativeModelAssetService(options = {}) {
	const templateCache = new ModelTemplateCache({
		loadTemplate: async (resourceUrl) => loadTinyGltf(resourceUrl)
	});
	return new ModelAssetService({
		templateCache,
		instantiateTemplate: async (template, context) => {
			return instantiateTinyGltf(
				template,
				{ label: context.label }
			);
		},
		decorateInstance: options.decorateInstance || decorateInstance
	});
}

/** @param {object} root Native actor root. @param {Array<object>} clips Native animation clips. @returns {TinyAnimationPlayer} */
export function createNativeAnimationPlayer(root, clips = []) {
	return new TinyAnimationPlayer(root, clips);
}

/** @param {object} instance Native isolated model. @param {object} context Asset load context. @returns {object} */
function decorateInstance(instance, context) {
	if (instance?.scene?.userData) {
		instance.scene.userData.awtsmoosModelAssetService = true;
		instance.scene.userData.awtsmoosResourceUrl = context.resourceUrl;
	}
	return instance;
}
