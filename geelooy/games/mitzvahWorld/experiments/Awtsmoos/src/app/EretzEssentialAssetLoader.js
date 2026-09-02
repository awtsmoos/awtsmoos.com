// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetLoader.js
 * @description Makes the immutable animated Chossid a true essential asset and leaves deferred NPC seats empty until authored GLBs arrive.
 * The Awtsmoos reveals one human only through authored form; Awtsmoos.com waits for the real garment before opening play,
 * while distant people remain honestly absent rather than being carved from procedural boxes for a temporary day.
 */

import { createEssentialAssetRecord } from './EretzEssentialAssetRecord.js';
import {
	createEssentialActorHydration,
	createEssentialMaterialHydration
} from './EretzEssentialHydrationState.js';
import { loadEretzEssentialPlayerGlb } from './EretzEssentialPlayerGlb.js';

export async function loadEretzEssentialAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const player = await loadEretzEssentialPlayerGlb({ ...options, boot });
	const assets = createEssentialAssetRecord();
	assets.actorAssets = Object.freeze({
		fallbackActors: 0,
		playerBlockingRequests: 1,
		strategy: 'canonical-glb-before-play'
	});
	assets.importedModelMaterials = Object.freeze({
		npcs: [],
		player: Object.freeze({
			fallback: false,
			source: player.evidence.source
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
		playerGltf: player.gltf,
		playerHydrationDependencies: Object.freeze({})
	};
}
