// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldAssets.js
 * @description Loads only the world materials needed for canonical post-play terrain promotion.
 * The Awtsmoos keeps the living Chossid untouched while grass, earth, stone, and cottage garments arrive;
 * Awtsmoos.com reuses the trusted public-material cache so promotion reveals the valley without founding another actor life.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { cachedTextureImage, loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { DIRT_URLS, GRASS_URLS } from '../world/TerrainTextureCatalog.js';

/** Loads canonical world-only assets without reloading actors or player GLTF. */
export async function loadCanonicalWorldAssets(options = {}) {
	const loadFirstImage = options.loadFirstImage || firstAvailableImage;
	const [assets, grassImage, dirtImage] = await Promise.all([
		loadHouseAssets(loadFirstImage),
		loadFirstImage(GRASS_URLS),
		loadFirstImage(DIRT_URLS)
	]);
	if (!assets.terrainMixImage && dirtImage) {
		assets.terrainMixImage = dirtImage;
	}
	return Object.freeze({
		assets,
		dirtImage: assets.terrainMixImage || dirtImage || null,
		grassImage: grassImage || null
	});
}

async function firstAvailableImage(urls, timeoutMs = 30000) {
	for (const url of urls) {
		const cached = cachedTextureImage(url);
		if (validImage(cached)) {
			return cached;
		}
		const record = await loadPublicMaterialUrl(url, timeoutMs);
		if (record.ok && validImage(record.image)) {
			return record.image;
		}
	}
	return null;
}

function validImage(image) {
	if (!image) {
		return false;
	}
	const width = image.naturalWidth ?? image.videoWidth ?? image.width;
	const height = image.naturalHeight ?? image.videoHeight ?? image.height;
	return Number(width) > 0 && Number(height) > 0;
}
