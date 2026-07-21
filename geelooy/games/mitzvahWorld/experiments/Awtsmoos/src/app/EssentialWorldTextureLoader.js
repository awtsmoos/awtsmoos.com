// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EssentialWorldTextureLoader.js
 * @description Loads visible ground, house, mountain, bark, and leaf textures before world birth.
 * The Awtsmoos reveals form and garment together; Awtsmoos.com no longer lets an empty terrain,
 * unpainted cottage, or green placeholder canopy become the player's first view of creation.
 */

import {
	loadPublicMaterialUrl,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { terrainLayerRecipe } from '../world/terrain/TerrainLayerRecipe.js';
import { mountainRockStack } from '../world/materials/MountainVillageMaterialPresets.js';
import { villageMaterialPolicy } from '../world/village/DistanceMaterialPolicy.js';
import { treeSemanticTextureUrls } from '../world/trees/TreeSemanticMaterialCatalog.js';

export async function loadEssentialWorldTextures(options = {}) {
	const urls = essentialWorldTextureUrls();
	const records = new Array(urls.length);
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor++;
			records[index] = await loadPublicMaterialUrl(urls[index], options.timeoutMs ?? 15000);
		}
	};
	const concurrency = Math.max(1, Math.min(options.textureConcurrency ?? 6, urls.length));
	await Promise.all(Array.from({ length: concurrency }, worker));
	const loaded = records.filter(record => record.ok).length;
	return {
		cache: publicMaterialCacheStats(),
		failed: urls.length - loaded,
		loaded,
		ok: loaded === urls.length,
		records,
		requested: urls.length,
		strategy: 'blocking-visible-world-high-resolution-textures'
	};
}

export function essentialWorldTextureUrls() {
	const terrain = terrainLayerRecipe('high').layers.map(layer => layer.url);
	const mountain = mountainRockStack().layers.map(layer => layer.url);
	const house = Object.values(villageMaterialPolicy('near'))
		.filter(value => typeof value === 'string' && /^https?:\/\//.test(value));
	return Object.freeze([...new Set([
		...terrain,
		...mountain,
		...house,
		...treeSemanticTextureUrls()
	])]);
}
