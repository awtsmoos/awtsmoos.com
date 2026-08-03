// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetTemplateCache.js
 * @description Owns trusted GLB template promises, parsing, eviction, and source receipts.
 * The Awtsmoos gives one measured garment to many independent forms;
 * Awtsmoos.com revokes temporary doors and evicts every promise that storms.
 */

import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { fetchAssetBuffer } from './ProgressiveAssetFetch.js';
import { isTrustedModelUrl } from './RemoteModelCatalog.js';

const templatePromises = new Map();
let templateLoads = 0;

export async function loadCachedModelTemplate(url, options = {}) {
	const resourceUrl = trustedModelUrl(url);
	const wasCached = templatePromises.has(resourceUrl);
	if (!wasCached) {
		templateLoads += 1;
		const promise = createTemplate(resourceUrl, options).catch(error => {
			templatePromises.delete(resourceUrl);
			throw modelLoadError(resourceUrl, error);
		});
		templatePromises.set(resourceUrl, promise);
	}
	const template = await templatePromises.get(resourceUrl);
	if (wasCached) options.onProgress?.({ cached: true, phase: 'ready', progress: 1 });
	return { resourceUrl, template };
}

export function modelTemplateCacheStats() {
	return {
		templateLoads,
		templatesCached: templatePromises.size
	};
}

export function clearModelTemplateCache() {
	templatePromises.clear();
	templateLoads = 0;
}

export function trustedModelResourceUrl(url) {
	return trustedModelUrl(url);
}

async function createTemplate(resourceUrl, options) {
	const asset = await fetchAssetBuffer(resourceUrl, options.onProgress, options);
	options.onProgress?.({
		cacheSource: asset.cacheSource,
		loaded: asset.buffer.byteLength,
		phase: 'parsing',
		progress: 1,
		resolvedUrl: asset.resolvedUrl,
		total: asset.buffer.byteLength
	});
	const objectUrl = URL.createObjectURL(new Blob([asset.buffer], { type: asset.contentType }));
	try {
		const template = await loadTinyGltf(objectUrl);
		template.scene.userData.originalSourceUrl = resourceUrl;
		template.scene.userData.resolvedSourceUrl = asset.resolvedUrl;
		template.scene.userData.remoteModelCacheSource = asset.cacheSource;
		options.onProgress?.({
			cacheSource: asset.cacheSource,
			phase: 'ready',
			progress: 1,
			resolvedUrl: asset.resolvedUrl
		});
		return template;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

function modelLoadError(resourceUrl, error) {
	const wrapped = new Error(`Unable to load trusted model ${resourceUrl}: ${error.message}`);
	wrapped.cause = error;
	return wrapped;
}

function trustedModelUrl(url) {
	const value = String(url || '').trim();
	if (!isTrustedModelUrl(value)) {
		throw new Error(`Model loading requires a verified content-addressed URL: ${value}`);
	}
	return value;
}
