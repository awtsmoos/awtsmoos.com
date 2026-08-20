// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldAssets.js
 * @description Promotes canonical world geometry from cached surfaces without waiting on public texture recovery.
 * The Awtsmoos reveals earth, cottage, river, and road before distant ornament finishes crossing the sea;
 * Awtsmoos.com keeps richer materials streaming later while real geometry replaces bootstrap simplicity immediately.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { DIRT_URLS, GRASS_URLS } from '../world/TerrainTextureCatalog.js';

export async function loadCanonicalWorldAssets(options = {}) {
	const cachedImage = options.cachedImage || cachedTextureImage;
	const houseLoader = options.houseLoader || loadHouseAssets;
	const cachedOnly = urls => Promise.resolve(firstCachedImage(urls, cachedImage));
	const [houseAssets, grassImage, dirtImage] = await Promise.all([
		houseLoader(cachedOnly),
		cachedOnly(GRASS_URLS),
		cachedOnly(DIRT_URLS)
	]);
	const assets = { ...houseAssets };
	if (!assets.terrainMixImage && dirtImage) {
		assets.terrainMixImage = dirtImage;
	}
	assets.canonicalWorldMaterialMode = 'geometry-first-cached-materials';
	return Object.freeze({
		assets,
		dirtImage: assets.terrainMixImage || dirtImage || null,
		grassImage: grassImage || null,
		policy: canonicalWorldAssetPolicy()
	});
}

export function firstCachedImage(urls, cachedImage = cachedTextureImage) {
	for (const url of urls || []) {
		const image = cachedImage(url);
		if (validImage(image)) return image;
	}
	return null;
}

export function canonicalWorldAssetPolicy() {
	return Object.freeze({
		mode: 'geometry-first-cached-materials',
		networkBlocking: false
	});
}

function validImage(image) {
	if (!image) return false;
	const width = image.naturalWidth ?? image.videoWidth ?? image.width;
	const height = image.naturalHeight ?? image.videoHeight ?? image.height;
	return Number(width) > 0 && Number(height) > 0;
}
