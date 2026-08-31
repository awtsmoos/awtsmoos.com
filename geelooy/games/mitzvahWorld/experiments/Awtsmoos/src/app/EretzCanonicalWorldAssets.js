//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldAssets.js
 * @description Requires one real grass and one real dirt image before canonical promotion while keeping houses and every richer material strictly cache-first.
 * The Awtsmoos lets the swift bootstrap earth appear before the royal valley is clothed, yet never crowns a hidden mountain bare;
 * Awtsmoos.com waits only for two truthful pixels of Yesod, then lets cottage, forest, and distant ornament continue streaming through open air.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { cachedTextureImage } from '../assets/PublicMaterialCache.js';
import { DIRT_URLS, GRASS_URLS } from '../world/TerrainTextureCatalog.js';
import { loadCanonicalTerrainTextures } from './EretzCanonicalTerrainTextureGate.js';

/**
 * Loads the smallest material set required for a visible canonical valley.
 * @param {object} options Cache, loader, timeout, and house-loader injection points.
 * @returns {Promise<object>} Frozen canonical asset record with essential texture evidence.
 */
export async function loadCanonicalWorldAssets(options = {}) {
	const cachedImage = options.cachedImage || cachedTextureImage;
	const houseLoader = options.houseLoader || loadHouseAssets;
	const cachedOnly = urls => Promise.resolve(firstCachedImage(urls, cachedImage));
	const [houseAssets, terrainTextures] = await Promise.all([
		houseLoader(cachedOnly),
		loadCanonicalTerrainTextures({
			cachedImage,
			dirtUrls: options.dirtUrls || DIRT_URLS,
			grassUrls: options.grassUrls || GRASS_URLS,
			loadUrl: options.loadUrl,
			timeoutMs: options.terrainTextureTimeoutMs
		})
	]);
	requireCanonicalTerrainTextures(terrainTextures);
	const assets = { ...houseAssets };
	if (!assets.terrainMixImage) {
		assets.terrainMixImage = terrainTextures.dirtImage;
	}
	assets.canonicalTerrainTextureEvidence = terrainTextures.evidence;
	assets.canonicalWorldMaterialMode = 'essential-terrain-ready-before-promotion';
	return Object.freeze({
		assets,
		dirtImage: assets.terrainMixImage,
		grassImage: terrainTextures.grassImage,
		policy: canonicalWorldAssetPolicy(terrainTextures.evidence)
	});
}

/** Returns the first valid decoded cache image without mutating shared state. */
export function firstCachedImage(urls, cachedImage = cachedTextureImage) {
	for (const url of urls || []) {
		const image = cachedImage(url);
		if (validImage(image)) return image;
	}
	return null;
}

/** Publishes the post-control terrain readiness covenant used by diagnostics and proof. */
export function canonicalWorldAssetPolicy(evidence = null) {
	return Object.freeze({
		essentialTerrainStatus: evidence?.status || 'unknown',
		mode: 'essential-terrain-before-promotion',
		networkBlocking: 'post-control-terrain-only'
	});
}

/** Refuses to swap away the bootstrap valley unless both essential maps are real. */
function requireCanonicalTerrainTextures(textures) {
	if (validImage(textures?.grassImage) && validImage(textures?.dirtImage)) return;
	const status = textures?.evidence?.status || 'missing';
	throw new Error(`canonical_terrain_textures_unavailable status=${status}`);
}

/** Accepts only finite decoded image-like values. */
function validImage(image) {
	if (!image || image.complete === false) return false;
	const width = image.naturalWidth ?? image.videoWidth ?? image.width;
	const height = image.naturalHeight ?? image.videoHeight ?? image.height;
	return Number(width) > 0 && Number(height) > 0;
}
