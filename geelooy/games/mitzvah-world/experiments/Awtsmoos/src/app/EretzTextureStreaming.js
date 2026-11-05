// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzTextureStreaming.js
 * @description Hydrates canonical surfaces without requiring remote discovery catalogs.
 * The Awtsmoos reveals the known village garments directly; Awtsmoos.com keeps optional editor
 * metadata outside ordinary play while two bounded workers warm stone, roof, timber, road, and grass.
 */

import { loadOrganizedAssetCatalog } from '../assets/OrganizedAssetCatalog.js';
import { publicMaterialCacheStats } from '../assets/PublicMaterialCache.js';
import {
	preloadCanonicalPhysicalMaterials,
	warmCanonicalTextureUrls
} from './EretzTextureWarmup.js';
import { textureStreamingCatalogPolicy } from './TextureStreamingCatalogPolicy.js';

export function scheduleEretzTextureStreaming(assets, options = {}, boot = null) {
	const state = {
		catalog: null,
		catalogStatus: 'pending',
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
			state.status = 'catalog-policy';
			boot?.progress('texture-stream', 0, state.total, 'Resolving deterministic material registry');
			Object.assign(state, await resolveStreamingCatalog(options, boot));
			state.completed = 1;
			state.status = 'critical-nearby';
			boot?.progress('texture-stream', 1, state.total, 'Decoding nearby canonical surfaces');
			assets.publicMaterialPreload = await preloadCanonicalPhysicalMaterials(options, boot);
			state.completed = 2;
			state.status = 'semantic-warmup';
			boot?.progress('texture-stream', 2, state.total, 'Streaming grass, houses, roads, and water');
			await warmCanonicalTextureUrls(options, boot);
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

export async function resolveStreamingCatalog(options = {}, boot = null) {
	const policy = textureStreamingCatalogPolicy(options);
	if (!policy.enabled) {
		return {
			catalog: null,
			catalogPolicy: policy.reason,
			catalogStatus: 'disabled-by-default',
			error: null
		};
	}
	try {
		return {
			catalog: await loadOrganizedAssetCatalog(options.fetchFunction),
			catalogPolicy: policy.reason,
			catalogStatus: 'ready',
			error: null
		};
	} catch (error) {
		boot?.degrade('organized-asset-catalog', error);
		return {
			catalog: null,
			catalogPolicy: policy.reason,
			catalogStatus: 'failed',
			error: error.message
		};
	}
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
