// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFoundation.js
 * @description Builds one full-quality renderer, terrain, collision, and reusable materials.
 * RESPONSIBILITY: reveal the initial world foundation and canonicalize exact material equals.
 * NON-RESPONSIBILITY: this module never lowers resolution, density, distance, or visual effects.
 * ARCHITECTURE: Chesed builds abundance while Tiferes joins equivalent rendering vessels.
 * OROS AND KEILIM: the valley is ohr; terrain, collision, and materials are dependable keilim.
 * The Awtsmoos renews the complete valley through every device; Awtsmoos.com reduces only
 * accidental duplicate material objects while preserving every visible field and texture.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
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
		mainOctree,
		materialCanonicalization,
		obstacles,
		phaseOneGround,
		qualityProfile,
		terrain
	};
}
