// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Builds renderer, terrain, collision, materials, and initial static-detail LOD.
 * The Awtsmoos reveals the complete valley before the traveler moves; Awtsmoos.com measures
 * authored distant garments once after construction, preserving every protected world anchor.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { createGroundSampler } from '../world/GroundPlacementSystem.js';
import { createObstacleField } from '../world/ObstacleField.js';
import { createSky3D } from '../world/Sky3D.js';
import {
	createTerrainPackage,
	heightAt
} from '../world/Terrain3D.js?v=20260720-canonical-valley-pass-04';
import { WorldGround } from '../world/WorldGround.js';
import { createWorldChunkRuntime } from '../world/streaming/WorldChunkRuntime.js';
import { loadEretzAssets } from './EretzAssetLoader.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js?v=20260720-canonical-valley-pass-04';
import { buildWorldCollisionOctree } from './WorldCollisionOctree.js';

export async function createEretzWorldFoundation(hosts, options = {}) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) {
		throw new Error('Eretz foundation requires a quality profile.');
	}
	const services = createEretzFoundationServices(hosts, qualityProfile);
	const loaded = await loadEretzAssets({
		...(options.assets || {}),
		quality: qualityProfile.quality
	});
	const phaseOneGround = createGroundSampler({
		terrainHeightAt: heightAt
	});
	const obstacles = createObstacleField(loaded.assets, phaseOneGround);
	const terrain = await createTerrainPackage(
		obstacles,
		loaded.grassImage,
		loaded.assets.terrainMixImage,
		phaseOneGround,
		{ quality: qualityProfile.quality }
	);
	const mainOctree = buildWorldCollisionOctree(terrain.colliders);
	const chunkRuntime = createWorldChunkRuntime({
		mainOctree,
		terrain
	});
	const collisionQuery = chunkRuntime.collisionQuery;
	const groundSampler = phaseOneGround.withOctree(collisionQuery);
	const ground = new WorldGround({
		octree: collisionQuery,
		terrainHeightAt: terrain.heightAt
	});
	terrain.stats.groundSampler = groundSampler.stats().mode;
	terrain.stats.qualityProfile = { ...qualityProfile };
	services.scene.add(createSky3D(qualityProfile.quality));
	services.scene.add(terrain.group);
	const initialLodRegistrations = services.sceneLod.refresh();
	const materialCanonicalization = canonicalizeSceneMaterials(services.scene);
	return {
		...hosts,
		...loaded,
		...services,
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionQuery,
		ground,
		groundSampler,
		initialLodRegistrations,
		mainOctree,
		materialCanonicalization,
		obstacles,
		phaseOneGround,
		qualityProfile,
		terrain
	};
}
