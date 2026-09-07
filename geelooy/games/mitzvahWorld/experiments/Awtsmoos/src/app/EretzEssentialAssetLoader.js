// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetLoader.js
 * @description Opens the playable bootstrap without remote actor assets and leaves canonical player, NPC, and rich material hydration for post-play work.
 * The Awtsmoos gives the near moment before the distant garment can arrive; Awtsmoos.com lets movement live from local vessels,
 * while authored Chossid cloth, neighbors, and richer pigments may descend afterward without ever holding the world at zero.
 */

import { createEssentialAssetRecord } from './EretzEssentialAssetRecord.js';
import {
	createEssentialActorHydration,
	createEssentialMaterialHydration
} from './EretzEssentialHydrationState.js';

/**
 * Creates an immediate asset record containing no blocking remote player request.
 * @param {object} [options={}] Runtime launch options and optional player loader dependency.
 * @returns {Promise<object>} Immediate bootstrap asset state for the playable core.
 */
export async function loadEretzEssentialAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const assets = createEssentialAssetRecord();
	assets.actorAssets = Object.freeze({
		fallbackActors: 1,
		playerBlockingRequests: 0,
		strategy: 'local-shell-before-canonical-hydration'
	});
	assets.importedModelMaterials = Object.freeze({
		npcs: [],
		player: Object.freeze({
			fallback: true,
			source: 'bootstrap-local-primitives'
		})
	});
	const actorHydration = createEssentialActorHydration(options);
	const materialHydration = createEssentialMaterialHydration(assets, options, boot);
	assets.publicMaterialStreaming = materialHydration;
	assets.publicMaterialHydration = materialHydration;
	return {
		actorAssetStats: assets.actorAssets,
		actorHydration,
		assets,
		grassImage: null,
		importedModelMaterials: assets.importedModelMaterials,
		npcGltf: null,
		npcGltfs: [],
		npcProfiles: [],
		playerGltf: null,
		playerHydrationDependencies: createPlayerHydrationDependencies(options)
	};
}

/** Preserves an injected GLTF loader for the post-play canonical hydration path. */
function createPlayerHydrationDependencies(options) {
	const dependencies = {};
	if (typeof options.playerLoader === 'function') {
		dependencies.loadGltf = options.playerLoader;
	}
	return Object.freeze(dependencies);
}
