// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EretzActorAssetLoader.js
 * @description Returns local Chossid forms immediately and hydrates exact shared GLBs afterward.
 * The Awtsmoos grants movement before remote form; Awtsmoos.com preserves dignified visible
 * fallbacks while one cached animated template enriches player and neighbors behind gameplay.
 */
import {
	applyChossidOutfit,
	chossidMaterialResolver
} from '../assets/ChossidOutfitPalette.js';
import { consolidateChossidMeshes } from '../assets/ChossidMeshConsolidator.js';
import { bindImportedModelMaterials } from '../assets/ModelMaterialBinder.js';
import {
	loadIsolatedGltf,
	sharedGltfAssetStats
} from '../assets/ModelAssetLoader.js';
import { friendlyNpcProfiles } from '../world/npc/FriendlyNpcProfiles.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { createFallbackActorGltf } from './EretzFallbackActorTemplate.js';

export function loadEretzActorAssets(options = {}) {
	const quality = options.quality || 'medium';
	const npcProfiles = friendlyNpcProfiles(quality);
	const playerGltf = createFallbackActorGltf('player');
	const npcGltfs = npcProfiles.map((profile, index) => createFallbackActorGltf(
		`friendly-npc-${index}-${profile.id}`,
		{ outfit: profile.outfit }
	));
	return {
		actorAssetStats: {
			fallbackActors: npcGltfs.length + 1,
			remoteBlockingRequests: 0,
			strategy: 'local-first-background-shared-gltf'
		},
		actorHydration: scheduleRemoteActorHydration(options, npcProfiles),
		importedModelMaterials: {
			npcs: npcProfiles.map(profile => ({ fallback: true, profileId: profile.id })),
			player: { fallback: true }
		},
		npcGltf: npcGltfs[0],
		npcGltfs,
		npcProfiles,
		playerGltf
	};
}

export async function loadRemoteEretzActorAssets(options = {}, npcProfiles = null) {
	const profiles = npcProfiles || friendlyNpcProfiles(options.quality || 'medium');
	const playerPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'player');
	const npcPromises = profiles.map((profile, index) => loadIsolatedGltf(
		PLAYER_MODEL_URL,
		`friendly-npc-${index}-${profile.id}`,
		{ materialResolver: chossidMaterialResolver(profile.outfit) }
	));
	const [playerGltf, ...npcGltfs] = await Promise.all([playerPromise, ...npcPromises]);
	const npcMaterials = npcGltfs.map((gltf, index) => prepareNpc(gltf, profiles[index]));
	const playerOutfit = applyChossidOutfit(playerGltf.scene, {});
	const playerMaterials = bindImportedModelMaterials(playerGltf.scene);
	return {
		actorAssetStats: sharedGltfAssetStats(),
		importedModelMaterials: {
			npcs: npcMaterials,
			player: {
				...playerMaterials,
				...playerOutfit,
				consolidation: consolidateChossidMeshes(playerGltf.scene)
			}
		},
		npcGltf: npcGltfs[0],
		npcGltfs,
		npcProfiles: profiles,
		playerGltf
	};
}

function scheduleRemoteActorHydration(options, npcProfiles) {
	const state = {
		error: null,
		startedAt: null,
		status: 'scheduled',
		value: null
	};
	const remoteLoader = options.remoteActorLoader || loadRemoteEretzActorAssets;
	state.promise = new Promise(resolve => {
		setTimeout(async () => {
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
		}, options.actorStreamingDelayMs ?? 0);
	});
	return state;
}

function prepareNpc(gltf, profile) {
	const outfit = applyChossidOutfit(gltf.scene, profile.outfit);
	return {
		...bindImportedModelMaterials(gltf.scene),
		...outfit,
		consolidation: consolidateChossidMeshes(gltf.scene),
		profileId: profile.id
	};
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
