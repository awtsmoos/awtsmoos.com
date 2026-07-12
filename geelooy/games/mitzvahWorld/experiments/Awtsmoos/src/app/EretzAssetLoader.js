// B"H
import { loadHouseAssets } from '../assets/HouseAssets.js';
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

/**
 * Hydrates the shared image cache before any material-bearing world definition is created.
 * The valley first receives real pigments; only afterward may stone, cloth, bark, and water rise.
 */
export async function loadEretzAssets() {
	const playerPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'player');
	const npcPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'npc');
	const materialPreload = await loadRuntimeMaterialRoles(WORLD_TEXTURE_MATERIALS, {
		timeoutMs: 20000,
		concurrency: 8
	});
	assertMaterialPreload(materialPreload);
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
	assets.publicMaterialCache = publicMaterialCacheStats();
	return { grassImage, assets, playerGltf, npcGltf };
}

/** Resolves declared URLs from the shared cache, loading only a genuinely absent candidate. */
export async function loadFirstImage(urls, timeoutMs = 15000) {
	for (const url of urls) {
		const cached = cachedTextureImage(url);
		if (cached) return cached;
		const record = await loadPublicMaterialUrl(url, timeoutMs);
		if (record.ok && record.image) return record.image;
	}
	return null;
}

function assertMaterialPreload(summary) {
	if (summary.ok) return;
	const failedRoles = summary.records
		.filter((record) => !record.loaded)
		.map((record) => `${record.role}: ${record.error}`)
		.join(', ');
	throw new Error(`World material preload failed: ${failedRoles}`);
}
