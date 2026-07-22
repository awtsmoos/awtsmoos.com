// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayableRuntimeBundleEntry.js
 * @description Collects only modules required to reach the first responsive playable frame.
 * The Awtsmoos gathers renderer, ground, actor, input, and movement into one revealed vessel;
 * Awtsmoos.com leaves textures, botany, remote actors, and distant models for later streams.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { resolveWorldQuality } from '../performance/WorldQualityProfile.js';
import { createGroundSampler } from '../world/GroundPlacementSystem.js';
import { createObstacleField } from '../world/ObstacleField.js';
import { createSky3D } from '../world/Sky3D.js';
import { createTerrainPackage, heightAt } from '../world/Terrain3D.js';
import { WorldGround } from '../world/WorldGround.js';
import { createWorldChunkRuntime } from '../world/streaming/WorldChunkRuntime.js';
import { assembleEretzCoreRuntime } from '../app/EretzCoreRuntimeAssembly.js';
import { loadEretzAssets } from '../app/EretzAssetLoader.js';
import { createEretzFoundationServices } from '../app/EretzFoundationServices.js';
import { reportLaunchProgress, throwIfLaunchAborted } from '../app/RuntimeLaunchProgress.js';
import { buildWorldCollisionOctreeAsync } from '../app/WorldCollisionOctree.js';

export async function createPlayableEretzRuntime(hosts, options = {}, boot) {
	const qualityProfile = resolveWorldQuality(options);
	throwIfLaunchAborted(options.signal);
	reportLaunchProgress(options, 'Opening the crystal-clear renderer…', 0.12);
	const services = createEretzFoundationServices(hosts, qualityProfile);
	reportLaunchProgress(options, 'Loading the player and solid village forms…', 0.24);
	const loaded = await loadEretzAssets({
		...(options.assets || {}),
		boot,
		quality: qualityProfile.quality
	});
	throwIfLaunchAborted(options.signal);
	const phaseOneGround = createGroundSampler({ terrainHeightAt: heightAt });
	const obstacles = createObstacleField(loaded.assets, phaseOneGround);
	const terrain = await createTerrainPackage(
		obstacles,
		loaded.grassImage,
		loaded.assets.terrainMixImage,
		phaseOneGround,
		{
			boot,
			environment: options.environment,
			onProgress: options.onProgress,
			quality: qualityProfile.quality
		}
	);
	throwIfLaunchAborted(options.signal);
	reportLaunchProgress(options, 'Indexing responsive movement collision…', 0.9);
	const mainOctree = await buildWorldCollisionOctreeAsync(terrain.colliders, {
		onProgress: options.onProgress
	});
	const chunkRuntime = createWorldChunkRuntime({ mainOctree, terrain });
	const collisionQuery = chunkRuntime.collisionQuery;
	const groundSampler = phaseOneGround.withOctree(collisionQuery);
	const ground = new WorldGround({ octree: collisionQuery, terrainHeightAt: terrain.heightAt });
	terrain.stats.groundSampler = groundSampler.stats().mode;
	terrain.stats.qualityProfile = { ...qualityProfile };
	services.scene.add(createSky3D(qualityProfile.quality));
	services.scene.add(terrain.group);
	const foundation = {
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
	foundation.initialLodRegistrations = services.sceneLod.refresh();
	foundation.materialCanonicalization = canonicalizeSceneMaterials(services.scene);
	reportLaunchProgress(options, 'Awakening actors, controls, and movement…', 0.96);
	const core = assembleEretzCoreRuntime(foundation, options, qualityProfile, boot);
	return { ...core, foundation, qualityProfile };
}
