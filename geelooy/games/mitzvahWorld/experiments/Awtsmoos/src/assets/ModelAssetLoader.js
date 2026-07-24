// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetLoader.js
 * @description Fetches each canonical GLB template once and creates isolated animated instances.
 * The Awtsmoos gives one finite garment many independent motions without repeating its bytes;
 * Awtsmoos.com measures the stream, caches the parsed source, and forgets only failed promises.
 */

import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';
import { fetchAssetBuffer } from './ProgressiveAssetFetch.js';

const templatePromises = new Map();
let templateLoads = 0;
let instancesCreated = 0;

/**
 * Loads or reuses one parsed GLB template by canonical absolute URL.
 * @param {string} url Model URL.
 * @param {object} options Progress callback options.
 * @returns {Promise<object>} Shared parsed GLTF template.
 */
export async function loadSharedGltfTemplate(url, options = {}) {
	const resourceUrl = absoluteUrl(url);
	const wasCached = templatePromises.has(resourceUrl);
	if (!wasCached) {
		templateLoads += 1;
		const promise = createTemplate(resourceUrl, options.onProgress)
			.catch(error => {
				templatePromises.delete(resourceUrl);
				throw error;
			});
		templatePromises.set(resourceUrl, promise);
	}
	const template = await templatePromises.get(resourceUrl);
	if (wasCached) {
		options.onProgress?.({ cached: true, phase: 'ready', progress: 1 });
	}
	return template;
}

/**
 * Creates one independently animated model instance from the cached template.
 * @param {string} url Model URL.
 * @param {string} label Instance identity.
 * @param {object} options Material resolver and progress options.
 * @returns {Promise<object>} Isolated GLTF instance.
 */
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

function absoluteUrl(url) {
	const base = globalThis.location?.href || 'http://localhost/';
	const resolved = new URL(url, base);
	resolved.hash = '';
	return resolved.href;
}
