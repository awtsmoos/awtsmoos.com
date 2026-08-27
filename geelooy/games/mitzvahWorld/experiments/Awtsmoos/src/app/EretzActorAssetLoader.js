// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorAssetLoader.js
 * @description Reveals local actors immediately and keeps canonical GLB parsing outside entry.
 * The Awtsmoos grants movement before a heavy garment is parsed; Awtsmoos.com begins with
 * dignified local Chassidim and exposes canonical actor hydration only as an explicit idle stream.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { friendlyNpcProfiles } from '../world/npc/FriendlyNpcProfiles.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { createFallbackActorGltf } from './EretzFallbackActorTemplate.js';
import { scheduleActorHydration } from './EretzActorHydrationScheduler.js';

export async function loadEretzActorAssets(options = {}) {
	const quality = options.quality || 'medium';
	const npcProfiles = friendlyNpcProfiles(quality);
	const playerGltf = createFallbackActorGltf('player');
	const npcGltfs = npcProfiles.map((profile, index) => createFallbackActorGltf(
		`friendly-npc-${index}-${profile.id}`,
		{ outfit: profile.outfit }
	));
	const houseLoader = options.houseLoader || loadHouseAssets;
	const assets = await houseLoader(async () => null);
	assets.actorAssets = actorStats(npcGltfs.length);
	assets.importedModelMaterials = fallbackMaterials(npcProfiles);
	return {
		actorAssetStats: assets.actorAssets,
		actorHydration: createDeferredActorHydration(options, npcProfiles),
		assets,
		importedModelMaterials: assets.importedModelMaterials,
		npcGltf: npcGltfs[0],
		npcGltfs,
		npcProfiles,
		playerGltf
	};
}

export function createDeferredActorHydration(options = {}, npcProfiles = []) {
	const enabled = options.streamCanonicalActors === true;
	const state = {
		enabled,
		error: null,
		promise: null,
		startedAt: null,
		status: enabled ? 'waiting-for-idle-start' : 'fallback-stable',
		value: null,
		start() {
			if (!enabled) return Promise.resolve(null);
			if (state.promise) return state.promise;
			state.status = 'scheduled';
			state.promise = scheduleActorHydration(options, async () => {
				state.startedAt = now();
				state.status = 'loading';
				try {
					state.value = await loadRemoteEretzActorAssets(options, npcProfiles);
					state.status = 'ready';
					return state.value;
				} catch (error) {
					state.error = error?.message || String(error);
					state.status = 'degraded';
					return null;
				}
			});
			return state.promise;
		}
	};
	return state;
}

export async function loadRemoteEretzActorAssets(options = {}, npcProfiles = []) {
	const loader = options.remoteActorLoader || defaultRemoteActorLoader;
	return loader(options, npcProfiles);
}

async function defaultRemoteActorLoader(options, npcProfiles) {
	const [{ loadIsolatedGltf, sharedGltfAssetStats }, palette] = await Promise.all([
		import('../assets/ModelAssetLoader.js?v=20260722-idle-actor-02'),
		import('../assets/ChossidOutfitPalette.js?v=20260722-idle-actor-02')
	]);
	const playerGltf = await loadIsolatedGltf(PLAYER_MODEL_URL, 'player-canonical');
	const npcGltfs = await Promise.all(npcProfiles.map((profile, index) => loadIsolatedGltf(
		PLAYER_MODEL_URL,
		`friendly-npc-${index}-${profile.id}`,
		{ materialResolver: palette.chossidMaterialResolver(profile.outfit) }
	)));
	return {
		actorAssetStats: sharedGltfAssetStats(),
		npcGltf: npcGltfs[0],
		npcGltfs,
		npcProfiles,
		playerGltf
	};
}

function actorStats(fallbackActors) {
	return {
		fallbackActors,
		playerBlockingRequests: 0,
		strategy: 'procedural-first-explicit-idle-canonical-hydration'
	};
}

function fallbackMaterials(npcProfiles) {
	return {
		npcs: npcProfiles.map(profile => ({ fallback: true, profileId: profile.id })),
		player: { fallback: true, source: 'local-procedural-chossid-silhouette' }
	};
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
