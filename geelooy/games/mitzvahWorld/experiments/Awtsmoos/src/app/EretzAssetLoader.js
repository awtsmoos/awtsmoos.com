// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAssetLoader.js
 * @description Loads one shared actor template and degradable world materials in parallel.
 * The Awtsmoos renews people and landscape beyond remote resources; Awtsmoos.com keeps
 * actor bones distinct, source buffers shared, and missing decorative pigment nonfatal.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { assertCriticalMaterialPreload } from '../assets/MaterialPreloadPolicy.js';
import {
	cachedTextureImage,
	loadPublicMaterialUrl,
	preloadPublicMaterialImages,
	progressivelyHydratePublicMaterials,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { WORLD_TEXTURE_MATERIALS } from '../assets/WorldTextureManifest.js';
import { GRASS_URLS } from '../world/Terrain3D.js';
import { loadEretzActorAssets } from './EretzActorAssetLoader.js';

export async function loadEretzAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	boot?.begin('critical-materials-and-shared-actors');
	const actorPromise = loadEretzActorAssets(options);
	const criticalPreload = await preloadPublicMaterialImages({
		concurrency: 4,
		timeoutMs: options.criticalMaterialTimeoutMs || 3500
	});
	const materialPolicy = assertCriticalMaterialPreload(
		criticalPreload,
		WORLD_TEXTURE_MATERIALS
	);
	const requiredTimeout = options.requiredImageTimeoutMs || 7000;
	const [grassImage, assets, actors] = await Promise.all([
		loadFirstImage(GRASS_URLS, requiredTimeout),
		loadHouseAssets((urls, timeoutMs) => loadFirstImage(
			urls,
			Math.min(timeoutMs, requiredTimeout)
		)),
		actorPromise
	]);
	recordHouseMaterialDegradation(boot, assets);
	assets.actorAssets = actors.actorAssetStats;
	assets.importedModelMaterials = actors.importedModelMaterials;
	assets.publicMaterialPreload = criticalPreload;
	assets.publicMaterialPolicy = materialPolicy;
	assets.publicMaterialCache = publicMaterialCacheStats();
	assets.publicMaterialHydration = scheduleOptionalHydration(assets, options);
	return {
		...actors,
		assets,
		grassImage
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
