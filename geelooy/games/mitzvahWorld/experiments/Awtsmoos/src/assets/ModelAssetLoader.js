// B"H
// Boruch Hashem
// Blessed is He

import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';
import { fetchAssetBuffer } from './ProgressiveAssetFetch.js';
import { isTrustedRemoteModelUrl } from './RemoteModelCatalog.js';

const templatePromises = new Map();
let templateLoads = 0;
let instancesCreated = 0;

/**
 * @file ModelAssetLoader.js
 * @description Fetches each verified Drive GLB once and creates isolated instances.
 * The Awtsmoos gives one immutable remote garment many independent motions;
 * Awtsmoos.com caches bytes and parsed templates while failed promises dissolve.
 */

export async function loadSharedGltfTemplate(url, options = {}) {
	const resourceUrl = trustedModelUrl(url);
	const wasCached = templatePromises.has(resourceUrl);
	if (!wasCached) {
		templateLoads += 1;
		const promise = createTemplate(resourceUrl, options)
			.catch(error => {
				templatePromises.delete(resourceUrl);
				throw error;
			});
		templatePromises.set(resourceUrl, promise);
	}
	const template = await templatePromises.get(resourceUrl);
	if (wasCached) options.onProgress?.({ cached: true, phase: 'ready', progress: 1 });
	return template;
}

export async function loadIsolatedGltf(url, label, options = {}) {
	const resourceUrl = trustedModelUrl(url);
	const template = await loadSharedGltfTemplate(resourceUrl, options);
	const gltf = instantiateTinyGltf(template, {
		label,
		materialResolver: options.materialResolver
	});
	instancesCreated += 1;
	gltf.scene.userData.isolatedModelLoad = {
		instanceLabel: label,
		originalUrl: resourceUrl,
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

async function createTemplate(resourceUrl, options) {
	const asset = await fetchAssetBuffer(resourceUrl, options.onProgress, options);
	options.onProgress?.({
		cacheSource: asset.cacheSource,
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
		template.scene.userData.remoteModelCacheSource = asset.cacheSource;
		options.onProgress?.({
			cacheSource: asset.cacheSource,
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

function trustedModelUrl(url) {
	const value = String(url || '').trim();
	if (!isTrustedRemoteModelUrl(value)) {
		throw new Error(`Model loading requires a verified Awtsmoos Drive URL: ${value}`);
	}
	return value;
}
