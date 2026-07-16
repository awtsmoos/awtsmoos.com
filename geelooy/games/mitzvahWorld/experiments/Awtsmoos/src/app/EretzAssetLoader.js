// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAssetLoader.js
 * @description Returns actors and authored fallback materials without awaiting remote textures.
 * The Awtsmoos renews form before pigment; Awtsmoos.com makes the shared actor template the
 * only awaited asset while catalog and canonical textures stream after the world can move.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import {
	cachedTextureImage,
	loadPublicMaterialUrl,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { GRASS_URLS } from '../world/Terrain3D.js';
import { loadEretzActorAssets } from './EretzActorAssetLoader.js';
import { scheduleEretzTextureStreaming } from './EretzTextureStreaming.js';

export async function loadEretzAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const actorLoader = options.actorLoader || loadEretzActorAssets;
	const houseLoader = options.houseLoader || loadHouseAssets;
	const textureScheduler = options.textureScheduler || scheduleEretzTextureStreaming;
	boot?.begin('actors-and-solid-materials');
	boot?.progress('shared-actor', 0, 1, 'Loading one reusable animated actor template');
	const [actors, assets] = await Promise.all([
		actorLoader(options),
		houseLoader(async () => null)
	]);
	boot?.progress('shared-actor', 1, 1, 'Actor template ready; geometry may begin', 'ready');
	assets.actorAssets = actors.actorAssetStats;
	assets.importedModelMaterials = actors.importedModelMaterials;
	assets.publicMaterialCache = publicMaterialCacheStats();
	assets.publicMaterialPolicy = Object.freeze({
		blockingTextureRequests: 0,
		fallbackFirst: true,
		strategy: 'solid-first-scene-referenced-canonical-streaming'
	});
	assets.publicMaterialStreaming = textureScheduler(assets, options, boot);
	assets.publicMaterialHydration = assets.publicMaterialStreaming;
	return {
		...actors,
		assets,
		grassImage: firstCachedImage(GRASS_URLS)
	};
}

export async function loadFirstImage(urls, timeoutMs = 7000) {
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
