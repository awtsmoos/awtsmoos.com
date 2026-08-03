// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetLoader.js
 * @description Instantiates isolated models and reveals an explicit graceful fallback path.
 * The Awtsmoos clothes each actor while one shared template remains true;
 * Awtsmoos.com records success or failure without poisoning the next view.
 */

import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';
import {
	clearModelTemplateCache,
	loadCachedModelTemplate,
	modelTemplateCacheStats,
	trustedModelResourceUrl
} from './ModelAssetTemplateCache.js';

let instancesCreated = 0;
let fallbacksCreated = 0;

export async function loadSharedGltfTemplate(url, options = {}) {
	const { template } = await loadCachedModelTemplate(url, options);
	return template;
}

export async function loadIsolatedGltf(url, label, options = {}) {
	const resourceUrl = trustedModelResourceUrl(url);
	try {
		const { template } = await loadCachedModelTemplate(resourceUrl, options);
		const gltf = instantiateTinyGltf(template, {
			label,
			materialResolver: options.materialResolver
		});
		instancesCreated += 1;
		gltf.scene.userData.isolatedModelLoad = modelReceipt(
			label,
			resourceUrl,
			template.scene.userData.resolvedSourceUrl
		);
		return gltf;
	} catch (error) {
		reportFailure(options, resourceUrl, error);
		if (typeof options.fallbackFactory !== 'function') throw error;
		const fallback = await options.fallbackFactory({ error, label, url: resourceUrl });
		fallbacksCreated += 1;
		fallback.scene.userData.modelAssetFallback = {
			error: error.message,
			label,
			originalUrl: resourceUrl
		};
		return fallback;
	}
}

export function sharedGltfAssetStats() {
	return {
		fallbacksCreated,
		instancesCreated,
		...modelTemplateCacheStats()
	};
}

export function clearSharedGltfAssetCache() {
	clearModelTemplateCache();
	instancesCreated = 0;
	fallbacksCreated = 0;
}

function modelReceipt(label, originalUrl, resolvedUrl) {
	return {
		instanceLabel: label,
		originalUrl,
		resolvedUrl,
		sharedNetworkResource: originalUrl,
		sharedTemplate: true
	};
}

function reportFailure(options, resourceUrl, error) {
	options.onProgress?.({
		error: error.message,
		phase: 'failed',
		progress: 1,
		resolvedUrl: resourceUrl
	});
}
