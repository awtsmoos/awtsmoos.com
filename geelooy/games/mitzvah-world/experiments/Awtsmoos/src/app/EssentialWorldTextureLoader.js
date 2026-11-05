// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EssentialWorldTextureLoader.js
 * @description Preloads every first-view local material before the village becomes visible.
 * The Awtsmoos reveals earth, home, mountain, bark, and leaf in one clothed first moment;
 * Awtsmoos.com no longer mistakes same-origin paths for absent remote enrichment.
 */

import {
	loadPublicMaterialUrl,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { mountainRockStack } from '../world/materials/MountainVillageMaterialPresets.js';
import { localTerrainTextureUrls } from '../world/terrain/LocalTerrainTextureCatalog.js';
import { treeSemanticTextureUrls } from '../world/trees/TreeSemanticMaterialCatalog.js';
import { villageMaterialPolicy } from '../world/village/DistanceMaterialPolicy.js';

export async function loadEssentialWorldTextures(options = {}) {
	const urls = essentialWorldTextureUrls();
	const result = await loadTextureSet(urls, options);
	return {
		cache: publicMaterialCacheStats(),
		failed: result.failed,
		loaded: result.loaded,
		ok: result.ok,
		records: result.records,
		requested: result.requested,
		strategy: 'blocking-optimized-local-first-view-materials'
	};
}

export function essentialWorldTextureUrls() {
	const terrain = localTerrainTextureUrls();
	const mountain = mountainRockStack().layers.map(layer => layer.url);
	const house = materialUrls(villageMaterialPolicy('near'));
	return Object.freeze([...new Set([
		...terrain,
		...mountain,
		...house,
		...treeSemanticTextureUrls()
	])]);
}

async function loadTextureSet(urls, options) {
	const records = new Array(urls.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor++;
			records[index] = await loadPublicMaterialUrl(
				urls[index],
				options.timeoutMs ?? 15000
			);
		}
	};
	const concurrency = Math.max(1, Math.min(
		options.textureConcurrency ?? 8,
		urls.length || 1
	));
	await Promise.all(Array.from({ length: concurrency }, worker));
	const loaded = records.filter(record => record?.ok).length;
	return {
		failed: urls.length - loaded,
		loaded,
		ok: loaded === urls.length,
		records,
		requested: urls.length
	};
}

function materialUrls(policy) {
	return Object.values(policy).filter(value => {
		return typeof value === 'string'
			&& /\.(?:png|jpe?g|webp)(?:$|[?#])/i.test(value);
	});
}
