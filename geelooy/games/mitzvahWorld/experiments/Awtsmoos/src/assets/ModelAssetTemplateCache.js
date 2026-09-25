// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetTemplateCache.js
 * @description Preserves the historical model-cache contract while parsing one trusted fetched ArrayBuffer directly.
 * The Awtsmoos gives one authored body one guarded road and one reusable template;
 * Awtsmoos.com keeps trust, cache identity, progress evidence, and source metadata intact while removing the old Blob refetch veil.
 */

import { loadTinyGltfBuffer } from '../../../light-three-gltf/tiny-gltf-loader.js';
import { fetchAssetBuffer } from './ProgressiveAssetFetch.js';
import { trustedModelResourceUrl } from './ModelAssetTrust.js';

const templates = new Map();
const pending = new Map();

/** Loads one trusted shared template using the historical `{resourceUrl, template}` receipt shape. */
export async function loadCachedModelTemplate(url, options = {}) {
	const resourceUrl = trustedModelResourceUrl(url);
	return {
		resourceUrl,
		template: await loadModelAssetTemplate(resourceUrl, options)
	};
}

/** Returns one parsed immutable template, sharing finished and in-flight work by canonical URL. */
export async function loadModelAssetTemplate(resourceUrl, options = {}) {
	if (templates.has(resourceUrl)) {
		options.onProgress?.(cachedProgress(resourceUrl));
		return templates.get(resourceUrl);
	}
	if (pending.has(resourceUrl)) return pending.get(resourceUrl);
	const promise = createTemplate(resourceUrl, options);
	pending.set(resourceUrl, promise);
	try {
		const template = await promise;
		templates.set(resourceUrl, template);
		return template;
	} finally {
		pending.delete(resourceUrl);
	}
}

/** Returns bounded cache evidence through the historical API. */
export function modelTemplateCacheStats() {
	return Object.freeze({
		cachedTemplates: templates.size,
		pendingTemplates: pending.size
	});
}

/** Clears all shared parsed templates and pending identities. */
export function clearModelAssetTemplateCache() {
	templates.clear();
	pending.clear();
}

/** Preserves the historical cache-clear export. */
export function clearModelTemplateCache() {
	clearModelAssetTemplateCache();
}

/** Preserves the historical trusted-resource export. */
export { trustedModelResourceUrl } from './ModelAssetTrust.js';

async function createTemplate(resourceUrl, options) {
	const startedAt = now();
	const progress = detail => options.onProgress?.(detail);
	progress(stage('asset-fetch-start', resourceUrl, startedAt));
	const asset = await fetchAssetBuffer(resourceUrl, progress, options);
	const fetchedAt = now();
	progress(stage('asset-fetch-complete', resourceUrl, fetchedAt, {
		bytes: asset.buffer.byteLength,
		fetchMilliseconds: elapsed(startedAt, fetchedAt)
	}));
	const parseStartedAt = now();
	const template = await loadTinyGltfBuffer(asset.buffer, resourceUrl, {
		onStage: evidence => progress(stage(`gltf-${evidence.name}`, resourceUrl, evidence.atMilliseconds, evidence))
	});
	decorateTemplate(template, resourceUrl, asset);
	const completedAt = now();
	const timing = Object.freeze({
		fetchMilliseconds: elapsed(startedAt, fetchedAt),
		parseMilliseconds: elapsed(parseStartedAt, completedAt),
		totalMilliseconds: elapsed(startedAt, completedAt),
		parser: template.stats?.timings || null
	});
	template.stats.modelAssetTiming = timing;
	progress(stage('asset-template-ready', resourceUrl, completedAt, timing));
	return template;
}

function decorateTemplate(template, resourceUrl, asset) {
	if (!template?.scene?.userData) return;
	template.scene.userData.originalSourceUrl = resourceUrl;
	template.scene.userData.resolvedSourceUrl = asset.resolvedUrl;
	template.scene.userData.remoteModelCacheSource = asset.cacheSource;
}

function cachedProgress(resourceUrl) {
	return { phase: 'cache-hit', progress: 1, resourceUrl };
}

function stage(phase, resourceUrl, atMilliseconds, details = {}) {
	return Object.freeze({ phase, resourceUrl, atMilliseconds, ...details });
}

function elapsed(startedAt, completedAt) {
	return Math.round((completedAt - startedAt) * 100) / 100;
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
