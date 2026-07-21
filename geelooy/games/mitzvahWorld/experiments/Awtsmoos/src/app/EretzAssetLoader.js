// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAssetLoader.js
 * @description Awaits the canonical player and all first-view high-resolution world materials.
 * The Awtsmoos reveals body, earth, mountain, home, bark, and leaf in one first moment;
 * Awtsmoos.com defers optional enrichment only after the visible world is genuinely clothed.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import {
	cachedTextureImage,
	loadPublicMaterialUrl,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { GRASS_URLS } from '../world/Terrain3D.js';
import { loadEretzActorAssets } from './EretzActorAssetLoader.js';
import { loadEssentialWorldTextures } from './EssentialWorldTextureLoader.js';
import { scheduleEretzTextureStreaming } from './EretzTextureStreaming.js';

export async function loadEretzAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const actorLoader = options.actorLoader || loadEretzActorAssets;
	const houseLoader = options.houseLoader || loadHouseAssets;
	const essentialLoader = options.essentialTextureLoader || loadEssentialWorldTextures;
	const textureScheduler = options.textureScheduler || scheduleEretzTextureStreaming;
	boot?.begin('actors-and-high-resolution-world-materials');
	boot?.progress('visible-world-assets', 0, 3, 'Loading player and visible world textures');
	const [actors, essential] = await Promise.all([
		actorLoader(options),
		essentialLoader(options)
	]);
	boot?.progress('visible-world-assets', 2, 3, 'Ground, houses, mountains, and trees are textured');
	const assets = await houseLoader(loadFirstImage);
	boot?.progress('visible-world-assets', 3, 3, 'Visible world is ready', 'ready');
	assets.actorAssets = actors.actorAssetStats;
	assets.essentialWorldTextures = essential;
	assets.importedModelMaterials = actors.importedModelMaterials;
	assets.publicMaterialCache = publicMaterialCacheStats();
	assets.publicMaterialPolicy = Object.freeze({
		blockingTextureRequests: essential.requested,
		fallbackFirst: false,
		strategy: 'high-resolution-visible-world-first'
	});
	assets.publicMaterialStreaming = textureScheduler(assets, options, boot);
	assets.publicMaterialHydration = assets.publicMaterialStreaming;
	return {
		...actors,
		assets,
		grassImage: firstCachedImage(GRASS_URLS)
	};
}

export async function loadFirstImage(urls, timeoutMs = 15000) {
	for (const url of urls) {
		const cached = cachedTextureImage(url);
		if (cached) return cached;
		const record = await loadPublicMaterialUrl(url, timeoutMs);
		if (record.ok && record.image) return record.image;
	}
	return null;
}

function firstCachedImage(urls) {
	for (const url of urls) {
		const image = cachedTextureImage(url);
		if (image) return image;
	}
	return null;
}
