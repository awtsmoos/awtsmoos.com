// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorAssetLoader.js
 * @description Loads only authored animated GLBs for the player and friendly Chassidim; procedural human substitutes are forbidden.
 * The Awtsmoos reveals each neighbor through one authored garment whose animation and material may truly live;
 * Awtsmoos.com chooses honest network waiting over carved boxes, so every human form the valley shows has a GLB source to give.
 */

import { loadHouseAssets } from '../assets/HouseAssets.js';
import { friendlyNpcProfiles } from '../world/npc/FriendlyNpcProfiles.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';
import { scheduleActorHydration } from './EretzActorHydrationScheduler.js';

export async function loadEretzActorAssets(options = {}) {
	const quality = options.quality || 'medium';
	const npcProfiles = friendlyNpcProfiles(quality);
	const houseLoader = options.houseLoader || loadHouseAssets;
	const [actors, assets] = await Promise.all([
		loadRemoteEretzActorAssets(options, npcProfiles),
		houseLoader(async () => null)
	]);
	assets.actorAssets = actorStats(actors.npcGltfs.length);
	assets.importedModelMaterials = canonicalMaterials(npcProfiles);
	return {
		...actors,
		actorAssetStats: assets.actorAssets,
		actorHydration: createDeferredActorHydration(options, npcProfiles),
		assets,
		importedModelMaterials: assets.importedModelMaterials
	};
}

export function createDeferredActorHydration(options = {}, npcProfiles = []) {
	const enabled = options.streamCanonicalActors === true;
	const state = {
		enabled,
		error: null,
		promise: null,
		startedAt: null,
		status: enabled ? 'waiting-for-idle-start' : 'canonical-ready',
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
		import('../assets/ModelAssetLoader.js?v=20260902-glb-humans-only-01'),
		import('../assets/ChossidOutfitPalette.js?v=20260902-glb-humans-only-01')
	]);
	const playerGltf = await loadIsolatedGltf(PLAYER_MODEL_URL, 'player-canonical');
	const npcGltfs = await Promise.all(npcProfiles.map((profile, index) => loadIsolatedGltf(
		PLAYER_MODEL_URL,
		`friendly-npc-${index}-${profile.id}`,
		{ materialResolver: palette.chossidMaterialResolver(profile.outfit) }
	)));
	return {
		actorAssetStats: sharedGltfAssetStats(),
		npcGltf: npcGltfs[0] || null,
		npcGltfs,
		npcProfiles,
		playerGltf
	};
}

function actorStats(npcCount) {
	return Object.freeze({
		canonicalNpcGlbs: npcCount,
		fallbackActors: 0,
		playerBlockingRequests: 1,
		strategy: 'authored-glb-humans-only'
	});
}

function canonicalMaterials(npcProfiles) {
	return Object.freeze({
		npcs: npcProfiles.map(profile => Object.freeze({ fallback: false, profileId: profile.id })),
		player: Object.freeze({ fallback: false, source: PLAYER_MODEL_URL })
	});
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
