// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCanonicalWorldHandoff.js
 * @description Promotes one complete canonical valley while retiring every independent bootstrap visual and collision vessel.
 * The Awtsmoos does not leave yesterday's provisional streets beneath today's mountain; Awtsmoos.com mounts the true
 * world first, closes the bootstrap district stream, releases its old collision, then renews mover, jump, ground, and scene.
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
	runtime.assets = { ...runtime.assets, ...promotion.assets };
	runtime.chunkRegistry = promotion.chunkRegistry;
	runtime.chunkRuntime = promotion.chunkRuntime;
	runtime.collisionQuery = promotion.collisionQuery;
	runtime.ground = promotion.ground;
	runtime.groundSampler = promotion.groundSampler;
	runtime.mainOctree = promotion.mainOctree;
	runtime.obstacles = promotion.obstacles;
	runtime.terrain = promotion.terrain;
}

function assignFoundationWorld(foundation, promotion) {
	foundation.assets = { ...foundation.assets, ...promotion.assets };
	foundation.chunkRegistry = promotion.chunkRegistry;
	foundation.chunkRuntime = promotion.chunkRuntime;
	foundation.collisionQuery = promotion.collisionQuery;
	foundation.ground = promotion.ground;
	foundation.groundSampler = promotion.groundSampler;
	foundation.mainOctree = promotion.mainOctree;
	foundation.obstacles = promotion.obstacles;
	foundation.terrain = promotion.terrain;
}

function refreshPlayerWorldAuthorities(runtime) {
	const playerModel = { footOffset: Number(runtime.footOffset) || 0 };
	const mover = createEretzMover(runtime, playerModel);
	runtime.collisionMover = mover;
	runtime.mover = mover;
	runtime.jumpPhysics = createEretzJumpPhysics(runtime, playerModel);
}
