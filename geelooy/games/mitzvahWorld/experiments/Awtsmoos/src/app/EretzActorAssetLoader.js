// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorAssetLoader.js
 * @description Loads the exact player Chossid before play and enriches neighbors afterward.
 * The Awtsmoos reveals the player as a living vessel at first sight; Awtsmoos.com awaits one
 * canonical chossid.glb, then streams NPC copies and optional animation richness later.
 */

import { applyChossidOutfit, chossidMaterialResolver } from '../assets/ChossidOutfitPalette.js';
import { consolidateChossidMeshes } from '../assets/ChossidMeshConsolidator.js';
import { bindImportedModelMaterials } from '../assets/ModelMaterialBinder.js';
import { loadIsolatedGltf, sharedGltfAssetStats } from '../assets/ModelAssetLoader.js';
import { friendlyNpcProfiles } from '../world/npc/FriendlyNpcProfiles.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { createFallbackActorGltf } from './EretzFallbackActorTemplate.js';

export async function loadEretzActorAssets(options = {}) {
	const quality = options.quality || 'medium';
	const npcProfiles = friendlyNpcProfiles(quality);
	const playerGltf = await loadCanonicalPlayer(options);
	const npcGltfs = npcProfiles.map((profile, index) => createFallbackActorGltf(
		`friendly-npc-${index}-${profile.id}`,
		{ outfit: profile.outfit }
	));
	return {
		actorAssetStats: {
			...sharedGltfAssetStats(),
			fallbackActors: npcGltfs.length,
			playerBlockingRequests: 1,
			strategy: 'canonical-player-first-deferred-npc-enrichment'
		},
		actorHydration: scheduleNpcHydration(options, npcProfiles),
		importedModelMaterials: {
			npcs: npcProfiles.map(profile => ({ fallback: true, profileId: profile.id })),
			player: preparePlayer(playerGltf)
		},
		npcGltf: npcGltfs[0],
		npcGltfs,
		npcProfiles,
		playerGltf
	};
}

export async function loadRemoteEretzActorAssets(options = {}, npcProfiles = null) {
	const profiles = npcProfiles || friendlyNpcProfiles(options.quality || 'medium');
	const npcGltfs = await Promise.all(profiles.map((profile, index) => loadIsolatedGltf(
		PLAYER_MODEL_URL,
		`friendly-npc-${index}-${profile.id}`,
		{ materialResolver: chossidMaterialResolver(profile.outfit) }
	)));
	return {
		actorAssetStats: sharedGltfAssetStats(),
		importedModelMaterials: {
			npcs: npcGltfs.map((gltf, index) => prepareNpc(gltf, profiles[index]))
		},
		npcGltf: npcGltfs[0],
		npcGltfs,
		npcProfiles: profiles
	};
}

async function loadCanonicalPlayer(options) {
	const loader = options.playerActorLoader || loadIsolatedGltf;
	try {
		return await loader(PLAYER_MODEL_URL, 'player');
	} catch (error) {
		if (options.allowPlayerFallback === true) return createFallbackActorGltf('player');
		throw new Error(`Canonical player chossid.glb failed to load: ${error?.message || error}`);
	}
}

function scheduleNpcHydration(options, npcProfiles) {
	const state = { error: null, startedAt: null, status: 'scheduled', value: null };
	const remoteLoader = options.remoteActorLoader || loadRemoteEretzActorAssets;
	state.promise = new Promise(resolve => setTimeout(async () => {
		state.startedAt = now();
		state.status = 'loading';
		try {
			state.value = await remoteLoader(options, npcProfiles);
			state.status = 'ready';
			resolve(state.value);
		} catch (error) {
			state.error = error?.message || String(error);
			state.status = 'degraded';
			resolve(null);
		}
	}, options.actorStreamingDelayMs ?? 0));
	return state;
}

function preparePlayer(gltf) {
	return {
		...bindImportedModelMaterials(gltf.scene),
		...applyChossidOutfit(gltf.scene, {}),
		consolidation: consolidateChossidMeshes(gltf.scene)
	};
}

function prepareNpc(gltf, profile) {
	return {
		...bindImportedModelMaterials(gltf.scene),
		...applyChossidOutfit(gltf.scene, profile.outfit),
		consolidation: consolidateChossidMeshes(gltf.scene),
		profileId: profile.id
	};
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
