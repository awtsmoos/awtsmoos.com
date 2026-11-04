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
import {
	ESSENTIAL_MILESTONES,
	completeMitzvahWorldEssentialMilestone,
	peekMitzvahWorldEssentialLedger,
	updateMitzvahWorldEssentialMilestone
} from '../app/MitzvahWorldEssentialBoot.js';
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
	publishEssentialFact(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, {
		importerStage: 'playable-terrain',
		resourceStatus: 'building'
	}, false);
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
	// The spawn terrain now truly exists in the scene. The staged foundation
	// phase publishes this same fact on the single-player path; the authored
	// (movie) path builds its terrain here, so here is where it must testify —
	// until this publication existed, a guarded movie boot sealed
	// ESSENTIAL_SPAWN_TERRAIN_EXISTS_TIMEOUT while its world stood ready.
	publishEssentialFact(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS, {
		importerStage: 'playable-terrain',
		resourceStatus: `colliders-${terrain.colliders?.length ?? 0}`
	}, true);
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

/**
 * Testifies to the essential gate only when a guarded ledger already lives in
 * this environment; routes without custody (embeds, tests) publish nothing
 * and never create a gate by accident. Testimony must never break building.
 */
function publishEssentialFact(environment, name, details, complete) {
	if (!peekMitzvahWorldEssentialLedger(environment)) return;
	try {
		if (complete) completeMitzvahWorldEssentialMilestone(environment, name, details);
		else updateMitzvahWorldEssentialMilestone(environment, name, details);
	} catch { /* the world outranks its own testimony */ }
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
