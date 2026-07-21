// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzAssetLoader.js
 * @description Returns the canonical actor and authored fallback materials before texture work.
 * The Awtsmoos reveals form before pigment; Awtsmoos.com keeps the default texture stream
 * dormant until the runtime confirms that movement and a first rendered frame are available.
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

/** Loads only assets required to construct a playable world. */
export async function loadEretzAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const actorLoader = options.actorLoader || loadEretzActorAssets;
	const houseLoader = options.houseLoader || loadHouseAssets;
	boot?.begin('actors-and-solid-materials');
	boot?.progress('shared-actor', 0, 1, 'Loading the canonical animated player');
	const [actors, assets] = await Promise.all([
		actorLoader(options),
		houseLoader(async () => null)
	]);
	boot?.progress('shared-actor', 1, 1, 'Player ready; building playable geometry', 'ready');
	assets.actorAssets = actors.actorAssetStats;
	assets.importedModelMaterials = actors.importedModelMaterials;
	assets.publicMaterialCache = publicMaterialCacheStats();
	assets.publicMaterialPolicy = Object.freeze({
		blockingTextureRequests: 0,
		fallbackFirst: true,
		strategy: 'solid-first-gameplay-gated-texture-streaming'
	});
	assets.publicMaterialStreaming = createTextureStream(assets, options, boot);
	assets.publicMaterialHydration = assets.publicMaterialStreaming;
	return {
		...actors,
		assets,
		grassImage: firstCachedImage(GRASS_URLS)
	};
}

/** Loads the first available image for explicit non-boot callers. */
export async function loadFirstImage(urls, timeoutMs = 7000) {
	for (const url of urls) {
		const cached = cachedTextureImage(url);
		if (cached) return cached;
		const record = await loadPublicMaterialUrl(url, timeoutMs);
		if (record.ok && record.image) return record.image;
	}
	return null;
}

function createTextureStream(assets, options, boot) {
	if (options.textureScheduler) {
		return options.textureScheduler(assets, options, boot);
	}
	let delegate = null;
	let error = null;
	let phase = 'waiting-for-gameplay';
	let resolvePromise;
	let startedAt = null;
	const state = {
		get completed() { return delegate?.completed ?? 0; },
		get error() { return delegate?.error || error; },
		promise: new Promise(resolve => {
			resolvePromise = resolve;
		}),
		get startedAt() { return delegate?.startedAt ?? startedAt; },
		get status() { return delegate?.status || phase; },
		get total() { return delegate?.total ?? 0; },
		start() {
			if (delegate) return state.promise;
			startedAt = now();
			phase = 'scheduled';
			delegate = scheduleEretzTextureStreaming(assets, options, boot);
			Promise.resolve(delegate.promise || delegate).then(value => {
				phase = delegate?.status || value?.status || 'ready';
				resolvePromise(value);
			}, caught => {
				error = caught?.message || String(caught);
				phase = 'degraded';
				boot?.degrade('texture-stream', caught);
				resolvePromise(null);
			});
			return state.promise;
		}
	};
	return state;
}

function firstCachedImage(urls) {
	for (const url of urls) {
		const image = cachedTextureImage(url);
		if (image) return image;
	}
	return null;
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
