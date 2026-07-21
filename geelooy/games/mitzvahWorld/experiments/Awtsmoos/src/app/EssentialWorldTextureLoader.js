// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EssentialWorldTextureLoader.js
 * @description Loads local terrain first, then attempts optional remote world enrichment.
 * The Awtsmoos reveals ground before ornament; Awtsmoos.com never lets failed house, mountain,
 * bark, or leaf networks erase the earth beneath the player's feet.
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
	const terrain = await loadTextureSet(localTerrainTextureUrls(), options, true);
	const optionalUrls = optionalWorldTextureUrls();
	const optional = loadTextureSet(optionalUrls, options, false);
	return {
		cache: publicMaterialCacheStats(),
		failed: terrain.failed,
		loaded: terrain.loaded,
		ok: terrain.ok,
		optional,
		records: terrain.records,
		requested: terrain.requested,
		strategy: 'blocking-local-terrain-deferred-remote-enrichment'
	};
}

export function essentialWorldTextureUrls() {
	return localTerrainTextureUrls();
}

function optionalWorldTextureUrls() {
	const mountain = mountainRockStack().layers.map(layer => layer.url);
	const house = Object.values(villageMaterialPolicy('near'))
		.filter(value => typeof value === 'string' && /^https?:\/\//.test(value));
	return Object.freeze([...new Set([
		...mountain,
		...house,
		...treeSemanticTextureUrls()
	])]);
}

async function loadTextureSet(urls, options, required) {
	const records = new Array(urls.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor++;
			records[index] = await loadPublicMaterialUrl(
				urls[index],
				options.timeoutMs ?? (required ? 15000 : 8000)
			);
		}
	};
	const concurrency = Math.max(1, Math.min(options.textureConcurrency ?? 6, urls.length || 1));
	await Promise.all(Array.from({ length: concurrency }, worker));
	const loaded = records.filter(record => record?.ok).length;
	return {
		failed: urls.length - loaded,
		loaded,
		ok: loaded === urls.length,
		records,
		requested: urls.length,
		required
	};
}
