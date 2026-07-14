// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetLoader.js
 * @description Parses each GLTF URL once and instantiates shared-resource actor scenes.
 * The Awtsmoos renews every player and neighbor as a distinct soul; Awtsmoos.com
 * downloads and parses one form, then gives each instance independent bones and motion.
 */

import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';

const templatePromises = new Map();
let templateLoads = 0;
let instancesCreated = 0;

export async function loadSharedGltfTemplate(url) {
	const resourceUrl = absoluteUrl(url);
	if (!templatePromises.has(resourceUrl)) {
		templateLoads += 1;
		templatePromises.set(resourceUrl, loadTinyGltf(resourceUrl));
	}
	return templatePromises.get(resourceUrl);
}

export async function loadIsolatedGltf(url, label, options = {}) {
	const resourceUrl = absoluteUrl(url);
	const template = await loadSharedGltfTemplate(resourceUrl);
	const gltf = instantiateTinyGltf(template, {
		label,
		materialResolver: options.materialResolver
	});
	instancesCreated += 1;
	gltf.scene.userData.isolatedModelLoad = {
		instanceLabel: label,
		originalUrl: url,
		sharedNetworkResource: resourceUrl,
		sharedTemplate: true
	};
	return gltf;
}

export function sharedGltfAssetStats() {
	return {
		instancesCreated,
		templateLoads,
		templatesCached: templatePromises.size
	};
}

export function clearSharedGltfAssetCache() {
	templatePromises.clear();
	templateLoads = 0;
	instancesCreated = 0;
}

function absoluteUrl(url) {
	const base = globalThis.location?.href || 'http://localhost/';
	return new URL(url, base).href;
}
