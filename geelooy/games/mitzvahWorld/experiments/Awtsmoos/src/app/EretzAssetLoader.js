// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAssetLoader.js
 * @description Loads critical actors while allowing remote visual materials to degrade.
 * The Awtsmoos renews the valley before network pigment arrives; Awtsmoos.com keeps
 * actor vessels critical but records missing house textures as honest nonfatal evidence.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { assertCriticalMaterialPreload } from '../assets/MaterialPreloadPolicy.js';
import { bindImportedModelMaterials } from '../assets/ModelMaterialBinder.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';
import {
	cachedTextureImage,
	loadPublicMaterialUrl,
	preloadPublicMaterialImages,
	progressivelyHydratePublicMaterials,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { WORLD_TEXTURE_MATERIALS } from '../assets/WorldTextureManifest.js';
import { GRASS_URLS } from '../world/Terrain3D.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

export async function loadEretzAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	boot?.begin('critical-materials-and-actors');
	const playerPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'player');
	const npcPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'npc');
	const criticalPreload = await preloadPublicMaterialImages({
		concurrency: 4,
		timeoutMs: options.criticalMaterialTimeoutMs || 3500
	});
	const materialPolicy = assertCriticalMaterialPreload(
		criticalPreload,
		WORLD_TEXTURE_MATERIALS
	);
	const requiredTimeout = options.requiredImageTimeoutMs || 7000;
	const [grassImage, assets, playerGltf, npcGltf] = await Promise.all([
		loadFirstImage(GRASS_URLS, requiredTimeout),
		loadHouseAssets((urls, timeoutMs) => loadFirstImage(
			urls,
			Math.min(timeoutMs, requiredTimeout)
		)),
		playerPromise,
		npcPromise
	]);
	bindActorMaterials(assets, playerGltf, npcGltf);
	recordHouseMaterialDegradation(boot, assets);
	assets.publicMaterialPreload = criticalPreload;
	assets.publicMaterialPolicy = materialPolicy;
	assets.publicMaterialCache = publicMaterialCacheStats();
	assets.publicMaterialHydration = scheduleOptionalHydration(assets, options);
	return { assets, grassImage, npcGltf, playerGltf };
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

function bindActorMaterials(assets, playerGltf, npcGltf) {
	assets.importedModelMaterials = {
		npc: bindImportedModelMaterials(npcGltf.scene),
		player: bindImportedModelMaterials(playerGltf.scene)
	};
}

function recordHouseMaterialDegradation(boot, assets) {
	const missing = assets.houseMaterialDegradation || [];
	if (!missing.length) return;
	boot?.degrade(
		'house-materials',
		new Error(`${missing.length} preferred house textures use authored color fallbacks.`)
	);
}

function scheduleOptionalHydration(assets, options) {
	const state = {
		error: null,
		startedAt: null,
		status: 'scheduled',
		summary: null
	};
	const delayMs = options.optionalMaterialDelayMs ?? 500;
	state.promise = new Promise(resolve => {
		setTimeout(async () => {
			state.startedAt = performance.now();
			state.status = 'loading';
			try {
				state.summary = await progressivelyHydratePublicMaterials({
					concurrency: 2,
					timeoutMs: options.optionalMaterialTimeoutMs || 6000
				});
				state.status = state.summary.failed ? 'degraded' : 'ready';
			} catch (error) {
				state.error = error.message;
				state.status = 'failed';
			}
			assets.publicMaterialCache = publicMaterialCacheStats();
			resolve(state);
		}, delayMs);
	});
	return state;
}
