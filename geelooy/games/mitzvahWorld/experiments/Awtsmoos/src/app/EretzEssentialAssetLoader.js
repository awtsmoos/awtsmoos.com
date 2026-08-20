// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetLoader.js
 * @description Opens control with a local Chossid silhouette while the exact GLB waits beyond first play.
 * The Awtsmoos grants motion before a heavy garment crosses the wire; Awtsmoos.com keeps the player
 * visibly human at once, then lets the canonical Chossid arrive through the existing grounded hydrator.
 */

import { createEssentialAssetRecord } from './EretzEssentialAssetRecord.js';
import { createFallbackActorGltf } from './EretzFallbackActorTemplate.js';
import {
	createEssentialActorHydration,
	createEssentialMaterialHydration
} from './EretzEssentialHydrationState.js';

export async function loadEretzEssentialAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	boot?.begin?.('essential-local-player');
	const playerGltf = createFallbackActorGltf('player-essential-bootstrap');
	const npcGltf = createFallbackActorGltf('npc-deferred-placeholder');
	const playerSource = playerGltf.scene.userData.isolatedModelLoad?.source
		|| 'local-procedural-chossid-silhouette';
	const assets = createEssentialAssetRecord();
	assets.actorAssets = Object.freeze({
		fallbackActors: 2,
		playerBlockingRequests: 0,
		strategy: 'play-first-canonical-next-frame'
	});
	assets.importedModelMaterials = Object.freeze({
		npcs: [],
		player: Object.freeze({
			fallback: true,
			source: playerSource
		})
	});
	const actorHydration = createEssentialActorHydration(options);
	const materialHydration = createEssentialMaterialHydration(assets, options, boot);
	assets.publicMaterialStreaming = materialHydration;
	assets.publicMaterialHydration = materialHydration;
	boot?.progress?.(
		'essential-local-player',
		1,
		1,
		'Playable local Chossid ready; canonical GLB streams after control.',
		'ready'
	);
	return {
		actorAssetStats: assets.actorAssets,
		actorHydration,
		assets,
		grassImage: null,
		importedModelMaterials: assets.importedModelMaterials,
		npcGltf,
		npcGltfs: [npcGltf],
		npcProfiles: [],
		playerGltf,
		playerHydrationDependencies: hydrationDependencies(options)
	};
}

function hydrationDependencies(options) {
	if (typeof options.playerLoader !== 'function') return {};
	return Object.freeze({ loadGltf: options.playerLoader });
}
