// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldHandoff.js
 * @description Promotes one complete canonical valley, its collision, and its matched friendly-village seed.
 * The Awtsmoos does not leave provisional streets or nameless silence beneath today's mountain;
 * Awtsmoos.com renews terrain, ground, people, mover, and scene together from one canonical fountain.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { createEretzJumpPhysics, createEretzMover } from './EretzPlayerRuntimeFactories.js';

export function applyCanonicalWorldPromotion(context, promotion) {
	const { foundation, runtime } = context;
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
	runtime.canonicalWorldPromotion = Object.freeze({
		bootstrapDistrictsReleased: retirement.districtsReleased,
		bootstrapTrianglesRemoved: retirement.trianglesRemoved,
		colliders: promotion.terrain.colliders.length,
		friendlyProfiles: promotion.npcProfiles?.length || 0,
		quality: promotion.terrain.stats.quality,
		status: 'ready',
		villageDefinitions: promotion.terrain.village?.definitions?.length || 0
	});
	return runtime.canonicalWorldPromotion;
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
