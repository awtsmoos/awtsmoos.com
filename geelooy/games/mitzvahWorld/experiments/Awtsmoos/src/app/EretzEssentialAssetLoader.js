// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetLoader.js
 * @description Loads the exact local Chossid before control, with a dignified fallback on failure.
 * The Awtsmoos grants the traveler a true garment in the first revealed frame;
 * Awtsmoos.com defers rich catalogs while never deferring the player's visible name.
 */

import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { createEssentialAssetRecord } from './EretzEssentialAssetRecord.js';
import { createFallbackActorGltf } from './EretzFallbackActorTemplate.js';
import {
	createEssentialActorHydration,
	createEssentialMaterialHydration
} from './EretzEssentialHydrationState.js';
import { loadIsolatedGltf } from '../assets/ModelAssetLoader.js';

export async function loadEretzEssentialAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	boot?.begin?.('essential-local-player');
	const playerResult = await loadEssentialPlayer(options, boot);
	const playerGltf = playerResult.gltf;
	const npcGltf = createFallbackActorGltf('npc-deferred-placeholder');
	const assets = createEssentialAssetRecord();
	assets.actorAssets = Object.freeze({
		fallbackActors: playerResult.fallback ? 2 : 1,
		playerBlockingRequests: 1,
		strategy: 'verified-local-chossid-first-remote-recovery'
	});
	assets.importedModelMaterials = Object.freeze({
		npcs: [],
		player: Object.freeze({
			fallback: playerResult.fallback,
			source: playerResult.source
		})
	});
	const actorHydration = createEssentialActorHydration(options);
	const materialHydration = createEssentialMaterialHydration(assets, options, boot);
	assets.publicMaterialStreaming = materialHydration;
	assets.publicMaterialHydration = materialHydration;
	boot?.progress?.('essential-local-player', 1, 1, playerResult.message, 'ready');
	return {
		actorAssetStats: assets.actorAssets,
		actorHydration,
		assets,
		grassImage: null,
		importedModelMaterials: assets.importedModelMaterials,
		npcGltf,
		npcGltfs: [npcGltf],
		npcProfiles: [],
		playerGltf
	};
}

async function loadEssentialPlayer(options, boot) {
	const loader = options.playerLoader || loadIsolatedGltf;
	try {
		const gltf = await loader(PLAYER_MODEL_URL, 'player-essential', {
			onProgress: detail => boot?.progress?.(
				'essential-local-player',
				detail.loaded || 0,
				detail.total || 0,
				'Loading the verified local Chossid.',
				detail.phase || 'download'
			)
		});
		return {
			fallback: false,
			gltf,
			message: 'Verified local Chossid ready.',
			source: gltf.scene.userData.isolatedModelLoad?.resolvedUrl || PLAYER_MODEL_URL
		};
	} catch (error) {
		console.warn('B"H Essential Chossid load failed; using the dignified fallback.', error);
		return {
			fallback: true,
			gltf: createFallbackActorGltf('player-essential-fallback'),
			message: 'Chossid fallback ready after verified asset failure.',
			source: 'local-procedural-chossid-silhouette'
		};
	}
}
