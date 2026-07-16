// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzActorAssetLoader.js
 * @description Fans one cached chossid template into player and friendly NPC instances.
 * The Awtsmoos renews every actor beyond the downloaded form; Awtsmoos.com shares
 * source buffers and palette colors while preserving independent bones and clothing.
 */

import {
	applyChossidOutfit,
	chossidMaterialResolver
} from '../assets/ChossidOutfitPalette.js';
import { bindImportedModelMaterials } from '../assets/ModelMaterialBinder.js';
import {
	loadIsolatedGltf,
	sharedGltfAssetStats
} from '../assets/ModelAssetLoader.js';
import { consolidateChossidMeshes } from '../assets/ChossidMeshConsolidator.js';
import { friendlyNpcProfiles } from '../world/npc/FriendlyNpcProfiles.js';
import { PLAYER_MODEL_URL } from './EretzConstants.js';

export async function loadEretzActorAssets(options = {}) {
	const quality = options.quality || 'medium';
	const npcProfiles = friendlyNpcProfiles(quality);
	const playerPromise = loadIsolatedGltf(PLAYER_MODEL_URL, 'player');
	const npcPromises = npcProfiles.map((profile, index) => loadIsolatedGltf(
		PLAYER_MODEL_URL,
		`friendly-npc-${index}-${profile.id}`,
		{ materialResolver: chossidMaterialResolver(profile.outfit) }
	));
	const [playerGltf, ...npcGltfs] = await Promise.all([
		playerPromise,
		...npcPromises
	]);
	const npcMaterialStats = npcGltfs.map((gltf, index) => {
		const outfitStats = applyChossidOutfit(
			gltf.scene,
			npcProfiles[index].outfit
		);
		return {
			...bindImportedModelMaterials(gltf.scene),
			...outfitStats,
			consolidation: consolidateChossidMeshes(gltf.scene),
			profileId: npcProfiles[index].id
		};
	});
	const playerOutfitStats = applyChossidOutfit(playerGltf.scene, {});
	const playerMaterialStats = bindImportedModelMaterials(playerGltf.scene);
	const playerConsolidation = consolidateChossidMeshes(playerGltf.scene);
	return {
		actorAssetStats: sharedGltfAssetStats(),
		importedModelMaterials: {
			npcs: npcMaterialStats,
			player: {
				...playerMaterialStats,
				...playerOutfitStats,
				consolidation: playerConsolidation
			}
		},
		npcGltf: npcGltfs[0],
		npcGltfs,
		npcProfiles,
		playerGltf
	};
}
