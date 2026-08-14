// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayableRuntimeBundleEntry.js
 * @description Collects first-frame systems while keeping legacy modular houses outside the authored canonical village.
 * The Awtsmoos gathers renderer, ground, actor, input, and motion into light;
 * Awtsmoos.com lets measured village architecture arise without an older giant house obscuring waterfall height.
 */

import { canonicalizeSceneMaterials } from '../assets/SceneMaterialCanonicalizer.js';
import { assembleEretzCoreRuntime } from '../app/EretzCoreRuntimeAssembly.js';
import { loadEretzAssets } from '../app/EretzAssetLoader.js';
import { createEretzFoundationServices } from '../app/EretzFoundationServices.js';
import { reportLaunchProgress, throwIfLaunchAborted } from '../app/RuntimeLaunchProgress.js';
import { buildWorldCollisionOctreeAsync } from '../app/WorldCollisionOctree.js';
import { resolveWorldQuality } from '../performance/WorldQualityProfile.js';
import { yieldRendererHydration } from '../render/yieldRendererHydration.js';
import { createGroundSampler } from '../world/GroundPlacementSystem.js';
import { createObstacleField } from '../world/ObstacleField.js';
import { createSky3D } from '../world/Sky3D.js';
import { createTerrainPackage, heightAt } from '../world/Terrain3D.js';
import { WorldGround } from '../world/WorldGround.js';
import { createWorldChunkRuntime } from '../world/streaming/WorldChunkRuntime.js';

export async function createPlayableEretzRuntime(hosts, options = {}, boot) {
	const environment = options.environment || globalThis;
	const qualityProfile = resolveWorldQuality(options);
	throwIfLaunchAborted(options.signal);
	boot.begin('playable-services');
	reportLaunchProgress(options, 'Opening the crystal-clear renderer…', 0.12);
	const services = createEretzFoundationServices(hosts, qualityProfile);
	await hydrationGate(environment, options);
	boot.begin('playable-assets');
	reportLaunchProgress(options, 'Preparing immediate player and solid materials…', 0.24);
	const loaded = await loadEretzAssets({
		...(options.assets || {}),
		boot,
		environment,
		quality: qualityProfile.quality
	});
	await hydrationGate(environment, options);
	boot.begin('playable-terrain');
	reportLaunchProgress(options, 'Building the responsive valley…', 0.4);
	const phaseOneGround = createGroundSampler({ terrainHeightAt: heightAt });
	const obstacles = createObstacleField(loaded.assets, phaseOneGround, { legacyHouses: false });
	const terrain = await createTerrainPackage(
		obstacles,
		loaded.grassImage,
		loaded.assets.terrainMixImage,
		phaseOneGround,
		{
			boot,
			environment,
			onProgress: options.onProgress,
			quality: qualityProfile.quality
		}
	);
	await hydrationGate(environment, options);
	boot.begin('playable-collision');
	reportLaunchProgress(options, 'Indexing responsive movement collision…', 0.9);
	const mainOctree = await buildWorldCollisionOctreeAsync(terrain.colliders, {
		onProgress: options.onProgress
	});
	await hydrationGate(environment, options);
	const chunkRuntime = createWorldChunkRuntime({ mainOctree, terrain });
	const collisionQuery = chunkRuntime.collisionQuery;
	const groundSampler = phaseOneGround.withOctree(collisionQuery);
	const ground = new WorldGround({ octree: collisionQuery, terrainHeightAt: terrain.heightAt });
	terrain.stats.groundSampler = groundSampler.stats().mode;
	terrain.stats.qualityProfile = { ...qualityProfile };
	boot.begin('playable-scene');
	services.scene.add(createSky3D(qualityProfile.quality));
	services.scene.add(terrain.group);
	const foundation = createFoundation({
		chunkRuntime,
		collisionQuery,
		ground,
		groundSampler,
		hosts,
		loaded,
		mainOctree,
		obstacles,
		phaseOneGround,
		qualityProfile,
		services,
		terrain
	});
	foundation.initialLodRegistrations = services.sceneLod.refresh();
	foundation.materialCanonicalization = canonicalizeSceneMaterials(services.scene);
	reportLaunchProgress(options, 'Awakening actors, controls, and movement…', 0.96);
	await hydrationGate(environment, options);
	const core = assembleEretzCoreRuntime(foundation, options, qualityProfile, boot);
	return { ...core, foundation, qualityProfile };
}

async function hydrationGate(environment, options) {
	throwIfLaunchAborted(options.signal);
	await yieldRendererHydration(environment);
	throwIfLaunchAborted(options.signal);
}

function createFoundation(values) {
	const { hosts, loaded, services, ...runtimeValues } = values;
	return { ...hosts, ...loaded, ...services, ...runtimeValues };
}
