// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetTemplateCache.js
 * @description Configures the procedural core model-template cache with Mitzvah World's trusted fetch and current tiny GLTF parser.
 * The Awtsmoos, Atzmus beyond game and library, renews one reusable cache law while this world supplies its own guarded doorway;
 * Awtsmoos.com now lets Mitzvah World look back to procedural core for template identity instead of owning a parallel store today.
 */

import { ModelTemplateCache } from '../../../../../../libs/awtsmoos-procedural-core/src/core/assets/index.js';
import { loadTinyGltf } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { fetchAssetBuffer } from './ProgressiveAssetFetch.js';
import { isTrustedModelUrl } from './RemoteModelCatalog.js';

const templateCache = new ModelTemplateCache({
	loadTemplate: createTemplate,
	resolveResource: trustedModelUrl
});

/** Loads one trusted shared GLTF template through the reusable core cache. */
export async function loadCachedModelTemplate(url, options = {}) {
	const loaded = await templateCache.load(url, options);
	return {
		resourceUrl: loaded.resourceUrl,
		template: loaded.template
	};
}

/** Returns core cache evidence through the historical Mitzvah API. */
export function modelTemplateCacheStats() {
	return templateCache.stats();
}

/** Clears the reusable core cache through the historical Mitzvah API. */
export function clearModelTemplateCache() {
	templateCache.clear();
}

/** Validates one Mitzvah World content-addressed model resource. */
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
	const objectUrl = URL.createObjectURL(
		new Blob([asset.buffer], { type: asset.contentType })
	);
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

function trustedModelUrl(url) {
	const value = String(url || '').trim();
	if (!isTrustedModelUrl(value)) {
		throw new Error(
			`Model loading requires a verified content-addressed URL: ${value}`
		);
	}
	return value;
}
