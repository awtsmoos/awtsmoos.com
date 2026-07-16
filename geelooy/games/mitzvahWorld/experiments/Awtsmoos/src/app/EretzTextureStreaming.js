// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzTextureStreaming.js
 * @description Warms organized catalogs and canonical full-source surfaces after play begins.
 * The Awtsmoos reveals form before pigment; Awtsmoos.com gives multi-megabyte grass, stone,
 * water, roof, and timber enough background time while only two semantic workers decode at once.
 */

import { houseImageEntries } from '../assets/HouseAssets.js';
import { loadOrganizedAssetCatalog } from '../assets/OrganizedAssetCatalog.js';
import {
	loadPublicMaterialUrl,
	preloadPublicMaterialImages,
	publicMaterialCacheStats
} from '../assets/PublicMaterialCache.js';
import { GRASS_URLS } from '../world/Terrain3D.js';

const BACKGROUND_TEXTURE_TIMEOUT_MS = 30000;

export function scheduleEretzTextureStreaming(assets, options = {}, boot = null) {
	const state = {
		catalog: null,
		completed: 0,
		error: null,
		startedAt: null,
		status: 'scheduled',
		total: 3
	};
	const delayMs = options.textureStreamingDelayMs ?? 0;
	state.promise = new Promise(resolve => {
		setTimeout(async () => {
			state.startedAt = now();
			state.status = 'catalog';
			boot?.progress('texture-stream', 0, state.total, 'Indexing organized Firebase categories');
			await loadCatalog(state, options, boot);
			state.completed = 1;
			state.status = 'critical-nearby';
			boot?.progress('texture-stream', 1, state.total, 'Decoding nearby canonical surfaces');
			assets.publicMaterialPreload = await preloadPublicMaterialImages({
				concurrency: 2,
				onSettled: record => recordSettled(boot, record),
				timeoutMs: textureTimeout(options)
			}).catch(error => degraded(boot, 'texture-preload', error));
			state.completed = 2;
			state.status = 'semantic-warmup';
			boot?.progress('texture-stream', 2, state.total, 'Streaming grass, houses, roads, and water');
			await warmSemanticUrls(options, boot);
			state.completed = 3;
			state.status = 'scene-cadence';
			assets.publicMaterialCache = publicMaterialCacheStats();
			state.cache = assets.publicMaterialCache;
			boot?.progress(
				'texture-stream',
				3,
				state.total,
				'Visible materials hydrate by ranked scene relevance.',
				'ready'
			);
			resolve(state);
		}, delayMs);
	});
	return state;
}

async function loadCatalog(state, options, boot) {
	try {
		state.catalog = await loadOrganizedAssetCatalog(options.fetchFunction);
	} catch (error) {
		state.error = error.message;
		boot?.degrade('organized-asset-catalog', error);
	}
}

async function warmSemanticUrls(options, boot) {
	const urls = [...new Set([
		...GRASS_URLS,
		...houseImageEntries().map(entry => entry.url)
	])];
	let cursor = 0;
	const worker = async () => {
		while (cursor < urls.length) {
			const index = cursor++;
			const record = await loadPublicMaterialUrl(urls[index], textureTimeout(options));
			if (!record.ok) boot?.degrade('canonical-texture', directTextureError(urls[index], record));
		}
	};
	await Promise.all([worker(), worker()]);
}

function recordSettled(boot, record) {
	if (record.loaded) return;
	const attempt = record.attempts?.at(-1) || {};
	const detail = `${attempt.stage || 'load'}:${record.error || attempt.error || 'unavailable'}`;
	boot?.degrade(record.role || 'runtime-material', new Error(`${detail}:${record.primaryUrl}`));
}

function directTextureError(url, record) {
	return new Error(`${record.stage || 'load'}:${record.error || 'unavailable'}:${url}`);
}

function degraded(boot, system, error) {
	boot?.degrade(system, error);
	return { failed: 1, loaded: 0, ok: false, records: [] };
}

function textureTimeout(options) {
	return options.textureTimeoutMs || BACKGROUND_TEXTURE_TIMEOUT_MS;
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
