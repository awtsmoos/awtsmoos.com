//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzCanonicalWorldHandoff.js
 * @description Promotes one canonical terrain authority, then awakens seamless region streaming without changing player coordinates.
 * The Awtsmoos does not divide valley from summit when finite packages appear or retire from sight;
 * Awtsmoos.com keeps one ground, one collision truth, one traveler, and one world while nearby regional vessels gather light.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { createEretzJumpPhysics, createEretzMover } from './EretzPlayerRuntimeFactories.js';
import { OpenWorldRegionStreamingRuntime } from './OpenWorldRegionStreamingRuntime.js';

export function applyCanonicalWorldPromotion(context, promotion) {
	const { foundation, runtime } = context;
	const diagnostics = context.diagnostics || null;
	const scene = runtime.scene || foundation.scene;
	const bootstrapGroup = runtime.terrain?.group;
	if (!scene || !promotion?.terrain?.group) {
		throw new Error('Canonical world promotion requires live scene and terrain group.');
	}
	scene.add(promotion.sky);
	scene.add(promotion.terrain.group);
	const retirement = retireBootstrapWorld(runtime, scene, bootstrapGroup);
	assignRuntimeWorld(runtime, promotion);
	assignFoundationWorld(foundation, promotion);
	refreshPlayerWorldAuthorities(runtime);
	foundation.sceneLod?.refresh?.();
	promotion.materialCanonicalization = canonicalizeSceneMaterials(scene);
	runtime.bootstrapRetirement = retirement;
	runtime.openWorldStreaming?.destroy?.();
	runtime.openWorldStreaming = new OpenWorldRegionStreamingRuntime(runtime);
	runtime.openWorldStreaming.update(runtime.model?.position || runtime.state);
	foundation.openWorldStreaming = runtime.openWorldStreaming;
	if (diagnostics) {
		diagnostics.openWorldStreaming = runtime.openWorldStreaming.diagnostics();
	}
	runtime.canonicalWorldPromotion = promotionReceipt(promotion, retirement, runtime);
	return runtime.canonicalWorldPromotion;
}

function promotionReceipt(promotion, retirement, runtime) {
	return Object.freeze({
		bootstrapDistrictsReleased: retirement.districtsReleased,
		bootstrapTrianglesRemoved: retirement.trianglesRemoved,
		colliders: promotion.terrain.colliders.length,
		friendlyProfiles: promotion.npcProfiles?.length || 0,
		openWorldId: runtime.openWorldStreaming.worldId,
		quality: promotion.terrain.stats.quality,
		status: 'ready',
		villageDefinitions: promotion.terrain.village?.definitions?.length || 0
	});
}

function retireBootstrapWorld(runtime, scene, bootstrapGroup) {
	const districtReceipt = runtime.districtStreaming?.dispose?.() || null;
	if (bootstrapGroup?.parent === scene) scene.remove(bootstrapGroup);
	return Object.freeze({
		districtsReleased: districtReceipt?.districtsReleased || 0,
		retired: true,
		terrainRemoved: bootstrapGroup?.parent !== scene,
		trianglesRemoved: districtReceipt?.trianglesRemoved || 0
	});
}

function assignRuntimeWorld(runtime, promotion) {
	Object.assign(runtime, worldAssignments(runtime, promotion));
}

function assignFoundationWorld(foundation, promotion) {
	Object.assign(foundation, worldAssignments(foundation, promotion));
}

function worldAssignments(target, promotion) {
	return {
		assets: { ...target.assets, ...promotion.assets },
		chunkRegistry: promotion.chunkRegistry,
		chunkRuntime: promotion.chunkRuntime,
		collisionQuery: promotion.collisionQuery,
		ground: promotion.ground,
		groundSampler: promotion.groundSampler,
		mainOctree: promotion.mainOctree,
		npcGltfs: promotion.npcGltfs,
		npcProfiles: promotion.npcProfiles,
		obstacles: promotion.obstacles,
		terrain: promotion.terrain
	};
}

function refreshPlayerWorldAuthorities(runtime) {
	const playerModel = { footOffset: Number(runtime.footOffset) || 0 };
	const mover = createEretzMover(runtime, playerModel);
	runtime.collisionMover = mover;
	runtime.mover = mover;
	runtime.jumpPhysics = createEretzJumpPhysics(runtime, playerModel);
}
