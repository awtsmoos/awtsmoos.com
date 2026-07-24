// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetLoader.js
 * @description Downloads each GLB once with measured progress, then instantiates it safely.
 * The Awtsmoos gives one shared form to many distinct souls; Awtsmoos.com measures the
 * network vessel honestly, parses locally, and preserves independent bones and motion.
 */

import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';
import { fetchAssetBuffer } from './ProgressiveAssetFetch.js?v=20260723-meadow-06';

const templatePromises = new Map();
let templateLoads = 0;
let instancesCreated = 0;

export async function loadSharedGltfTemplate(url, options = {}) {
	const resourceUrl = absoluteUrl(url);
	const wasCached = templatePromises.has(resourceUrl);
	if (!wasCached) {
		templateLoads += 1;
		templatePromises.set(
			resourceUrl,
			createTemplate(resourceUrl, options.onProgress)
		);
	}

	const template = await templatePromises.get(resourceUrl);
	if (wasCached) {
		options.onProgress?.({ phase: 'ready', progress: 1, cached: true });
	}
	return template;
}

export async function loadIsolatedGltf(url, label, options = {}) {
	const resourceUrl = absoluteUrl(url);
	const template = await loadSharedGltfTemplate(resourceUrl, options);
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

async function createTemplate(resourceUrl, onProgress) {
	const asset = await fetchAssetBuffer(resourceUrl, onProgress);
	onProgress?.({
		loaded: asset.buffer.byteLength,
		phase: 'parsing',
		progress: 1,
		total: asset.buffer.byteLength
	});
	const objectUrl = URL.createObjectURL(new Blob([asset.buffer], {
		type: asset.contentType
	}));

	try {
		const template = await loadTinyGltf(objectUrl);
		template.scene.userData.originalSourceUrl = resourceUrl;
		onProgress?.({
			loaded: asset.buffer.byteLength,
			phase: 'ready',
			progress: 1,
			total: asset.buffer.byteLength
		});
		return template;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
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
