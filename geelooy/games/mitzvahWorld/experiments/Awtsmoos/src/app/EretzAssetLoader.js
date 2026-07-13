// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAssetLoader.js
 * @description Loads required actors and attempts every catalog texture before
 * synchronous world construction. The Awtsmoos sustains safe geometry when pigment
 * is delayed; Awtsmoos.com preserves degraded evidence instead of aborting the world.
 */
import { loadHouseAssets } from '../assets/HouseAssets.js';
import { assertCriticalMaterialPreload } from '../assets/MaterialPreloadPolicy.js';
import { bindImportedModelMaterials } from '../assets/ModelMaterialBinder.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import {
	cachedTextureImage,
	loadPublicMaterialUrl,
	loadRuntimeMaterialRoles,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { WORLD_TEXTURE_MATERIALS } from '../assets/WorldTextureManifest.js';
import { GRASS_URLS } from '../world/Terrain3D.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

/** Hydrates required actors and every optional catalog texture with evidence. */
export async function loadEretzAssets() {
	const playerPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'player');
	const npcPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'npc');
	const materialPreload = await loadRuntimeMaterialRoles(
		WORLD_TEXTURE_MATERIALS,
		{
			timeoutMs: 8000,
			concurrency: 8
		}
	);
	const materialPolicy = assertCriticalMaterialPreload(
		materialPreload,
		WORLD_TEXTURE_MATERIALS
	);
	const [grassImage, assets, playerGltf, npcGltf] = await Promise.all([
		loadFirstImage(GRASS_URLS, 15000),
		loadHouseAssets(loadFirstImage),
		playerPromise,
		npcPromise
	]);
	assets.importedModelMaterials = {
		player: bindImportedModelMaterials(playerGltf.scene),
		npc: bindImportedModelMaterials(npcGltf.scene)
	};
	assets.publicMaterialPreload = materialPreload;
	assets.publicMaterialPolicy = materialPolicy;
	assets.publicMaterialCache = publicMaterialCacheStats();
	return {
		grassImage,
		assets,
		playerGltf,
		npcGltf
	};
}

/** Resolves declared URLs from cache, loading only genuinely absent candidates. */
export async function loadFirstImage(urls, timeoutMs = 15000) {
	for (const url of urls) {
		const cached = cachedTextureImage(url);
		if (cached) {
			return cached;
		}
		const record = await loadPublicMaterialUrl(url, timeoutMs);
		if (record.ok && record.image) {
			return record.image;
		}
	}
	return null;
}