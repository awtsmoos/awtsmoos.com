// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetLoader.js
 * @description Configures procedural core model lifecycle with Mitzvah World's current tiny-GLTF instance adapter and scene receipts.
 * The Awtsmoos, Atzmus beyond shared template and isolated actor, renews library law and game clothing without making two authorities;
 * Awtsmoos.com lets this world keep its tiny renderer bridge while cache, instance lifecycle, fallback accounting, and reuse live in core realities.
 */

import { ModelAssetService } from '../../../../../../libs/awtsmoos-procedural-core/src/core/assets/index.js';
import { instantiateTinyGltf } from '../../../light-three-gltf/tiny-gltf-instance.js';
import {
	clearModelTemplateCache,
	loadCachedModelTemplate,
	modelTemplateCacheStats,
	trustedModelResourceUrl
} from './ModelAssetTemplateCache.js';

const modelService = new ModelAssetService({
	decorateFallback,
	decorateInstance,
	instantiateTemplate,
	templateCache: {
		clear: clearModelTemplateCache,
		load: loadCachedModelTemplate,
		stats: modelTemplateCacheStats
	}
});

/** Returns one shared parsed GLTF template. */
export function loadSharedGltfTemplate(url, options = {}) {
	return modelService.loadShared(url, options);
}

/** Creates one isolated mutable GLTF instance or explicit fallback. */
export function loadIsolatedGltf(url, label, options = {}) {
	const resourceUrl = trustedModelResourceUrl(url);
	return modelService.loadIsolated(resourceUrl, label, {
		...options,
		onFailure: failure => {
			options.onFailure?.(failure);
			reportFailure(options, failure.resourceUrl, failure.error);
		}
	});
}

/** Returns shared cache plus isolated-instance evidence. */
export function sharedGltfAssetStats() {
	return modelService.stats();
}

/** Clears all shared template and instance diagnostics. */
export function clearSharedGltfAssetCache() {
	modelService.clear();
}

function instantiateTemplate(template, context) {
	return instantiateTinyGltf(template, {
		label: context.label,
		materialResolver: context.options.materialResolver
	});
}

function decorateInstance(gltf, context) {
	gltf.scene.userData.isolatedModelLoad = {
		instanceLabel: context.label,
		originalUrl: context.resourceUrl,
		resolvedUrl: context.template.scene.userData.resolvedSourceUrl,
		sharedNetworkResource: context.resourceUrl,
		sharedTemplate: true
	};
	return gltf;
}

function decorateFallback(fallback, context) {
	fallback.scene.userData.modelAssetFallback = {
		error: context.error.message,
		label: context.label,
		originalUrl: context.resourceUrl
	};
	return fallback;
}

function reportFailure(options, resourceUrl, error) {
	options.onProgress?.({
		error: error.message,
		phase: 'failed',
		progress: 1,
		resolvedUrl: resourceUrl
	});
}
