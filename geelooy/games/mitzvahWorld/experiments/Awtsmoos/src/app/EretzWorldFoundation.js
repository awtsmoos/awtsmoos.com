// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Builds one quality-aware renderer, terrain, collision, and input foundation.
 * The Awtsmoos renews the same essential valley through many device vessels;
 * Awtsmoos.com preserves collision and quests while visible abundance follows evidence.
 */

import { createGroundSampler } from '../world/GroundPlacementSystem.js';
import { createObstacleField } from '../world/ObstacleField.js';
import { createSky3D } from '../world/Sky3D.js';
import {
	createTerrainPackage,
	heightAt
} from '../world/Terrain3D.js';
import { WorldGround } from '../world/WorldGround.js';
import { createWorldChunkRuntime } from '../world/streaming/WorldChunkRuntime.js';
import { loadEretzAssets } from './EretzAssetLoader.js';
import { createEretzFoundationServices } from './EretzFoundationServices.js';
import { buildWorldCollisionOctree } from './WorldCollisionOctree.js';

export async function createEretzWorldFoundation(
	hosts,
	options = {}
) {
	const qualityProfile = options.qualityProfile;
	if (!qualityProfile) {
		throw new Error('Eretz foundation requires a quality profile.');
	}
	const services = createEretzFoundationServices(hosts, qualityProfile);
	const loaded = await loadEretzAssets(options.assets || {});
	const phaseOneGround = createGroundSampler({
		terrainHeightAt: heightAt
	});
	const obstacles = createObstacleField(
		loaded.assets,
		phaseOneGround
	);
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
	return {
		...hosts,
		...loaded,
		...services,
		chunkRegistry: chunkRuntime.registry,
		chunkRuntime,
		collisionQuery,
		ground,
		groundSampler,
		mainOctree,
		obstacles,
		phaseOneGround,
		qualityProfile,
		terrain
	};
}
