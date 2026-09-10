//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzEssentialAssetLoader.js
 * @description Makes the authored Chossid a non-negotiable boot asset while keeping NPC and extra material streams deferred.
 * No generated human is ever created: gameplay waits for the verified immutable GLB or fails visibly and honestly.
 */

import { createEssentialAssetRecord } from './EretzEssentialAssetRecord.js';
import { loadEretzEssentialPlayerGlb } from './EretzEssentialPlayerGlb.js';
import {
	createEssentialActorHydration,
	createEssentialMaterialHydration
} from './EretzEssentialHydrationState.js';

/**
 * Loads the canonical player before first gameplay while preserving later NPC/material enrichment.
 * @param {object} [options={}] Launch options and dependency-injected player loader.
 * @returns {Promise<object>} Essential asset state containing the real canonical Chossid.
 */
export async function loadEretzEssentialAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	const assets = createEssentialAssetRecord();
	const player = await loadEretzEssentialPlayerGlb(options);
	assets.actorAssets = canonicalActorEvidence(player.evidence);
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
		playerGlbEvidence: player.evidence,
		playerHydrationDependencies: Object.freeze({})
	};
}

/** Returns immutable evidence that the only boot human came from the authored GLB. */
function canonicalActorEvidence(evidence) {
	return Object.freeze({
		animations: evidence.animations,
		fallbackActors: 0,
		meshes: evidence.meshes,
		playerBlockingRequests: 1,
		source: evidence.source,
		strategy: 'canonical-glb-before-playable'
	});
}
