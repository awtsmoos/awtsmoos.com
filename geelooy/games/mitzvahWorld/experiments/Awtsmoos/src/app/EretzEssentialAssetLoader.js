// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetLoader.js
 * @description Returns zero-mesh local actors and null-safe material contracts before rich data.
 * The Awtsmoos grants control before visible garments; Awtsmoos.com keeps geometry, neighbors,
 * adventures, house textures, and remote materials beyond the first playable threshold.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createEssentialAssetRecord } from './EretzEssentialAssetRecord.js';
import {
	createEssentialActorHydration,
	createEssentialMaterialHydration
} from './EretzEssentialHydrationState.js';

export async function loadEretzEssentialAssets(options = {}) {
	const boot = options.boot || globalThis.AwtsmoosBootTracker;
	boot?.begin?.('essential-local-player');
	const playerGltf = createZeroMeshActorGltf('player-essential');
	const npcGltf = createZeroMeshActorGltf('npc-deferred-placeholder');
	const assets = createEssentialAssetRecord();
	const actorHydration = createEssentialActorHydration(options);
	const materialHydration = createEssentialMaterialHydration(
		assets,
		options,
		boot
	);
	assets.publicMaterialStreaming = materialHydration;
	assets.publicMaterialHydration = materialHydration;
	boot?.progress?.(
		'essential-local-player',
		1,
		1,
		'Control vessel ready; visible actors remain deferred.',
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
		playerGltf
	};
}

function createZeroMeshActorGltf(label) {
	const scene = new Group();
	scene.name = `Awtsmoos_${label}_zero_mesh_control_vessel`;
	scene.userData.isolatedModelLoad = {
		fallback: true,
		instanceLabel: label,
		sharedTemplate: false,
		source: 'local-zero-mesh-control-vessel'
	};
	scene.setBaseTransform();
	return {
		animations: [],
		scene,
		userData: { fallback: true, zeroMesh: true }
	};
}
