// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulationRuntimeFactory.js
 * @description Assembles real gameplay authorities around a renderer-free loaded GLB.
 * The Awtsmoos creates browser and Node mechanics from one law; Awtsmoos.com replaces
 * only DOM, WebGL, and wall waiting while every gameplay authority remains real.
 */

import { BootstrapMovementController } from '../app/BootstrapMovementController.js';
import { MinimalMeadowCombat } from '../app/MinimalMeadowCombat.js';
import { MinimalMeadowEquipmentRuntime } from '../app/MinimalMeadowEquipmentRuntime.js';
import { InventoryStore } from '../gameplay/InventoryStore.js';
import { createPlayerActionSystem } from '../playerActions/PlayerActionSystem.js';
import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { loadGlbManifest } from './GlbManifestLoader.js';
import { SIMULATION_COMBAT_EFFECTS } from './SimulationCombatEffects.js';
import { SimulationCollisionWorld } from './SimulationCollisionWorld.js';
import { SimulationEnemyPopulation } from './SimulationEnemyPopulation.js';
import { createSimulationFriendlyActors } from './SimulationFriendlyActors.js';
import { SimulationImportedAnimationState } from './SimulationImportedAnimationState.js';
import { SimulationInput } from './SimulationInput.js';
import {
	createSimulationCamera,
	createSimulationPlayerDefense,
	createSimulationPlayerState,
	createSimulationPlayerStats,
	createSimulationTerrain
} from './SimulationRuntimeState.js';
import { SimulationSceneNode } from './SimulationSceneNode.js';
import { SimulationScheduler } from './SimulationScheduler.js';
import { createSimulatedGltf } from './SimulatedModelFactory.js';

export async function createSimulationRuntime(options) {
	const manifest = await loadGlbManifest(options.modelPath);
	const gltf = createSimulatedGltf(manifest, 'simulation-player');
	const scene = new SimulationSceneNode('simulation-world');
	scene.add(gltf.scene);
	const collisionWorld = new SimulationCollisionWorld();
	addDefaultCollision(collisionWorld);
	const runtime = baseRuntime(scene, gltf, collisionWorld);
	runtime.inventory = new InventoryStore();
	runtime.equipment = new MinimalMeadowEquipmentRuntime(runtime);
	runtime.equipment.bindModel(runtime.model);
	runtime.importedAnimation = new SimulationImportedAnimationState(gltf);
	runtime.playerActionSystem = createPlayerActionSystem({
		actorId: 'simulation-player',
		bus: runtime.bus,
		equipment: runtime.equipment,
		model: runtime.model
	});
	runtime.movement = new BootstrapMovementController(runtime);
	runtime.combat = new MinimalMeadowCombat(runtime);
	runtime.friendlyActors = createSimulationFriendlyActors(manifest, scene);
	runtime.step = deltaSeconds => stepSimulationRuntime(runtime, deltaSeconds);
	return runtime;
}

function baseRuntime(scene, gltf, collisionWorld) {
	const scheduler = new SimulationScheduler();
	const playerStats = createSimulationPlayerStats();
	return {
		bus: new AwtsmoosEventBus(),
		camera: createSimulationCamera(),
		cameraRig: null,
		collisionMover: collisionWorld.mover,
		collisionWorld,
		combatEffects: SIMULATION_COMBAT_EFFECTS,
		enemies: new SimulationEnemyPopulation(),
		input: new SimulationInput(),
		mainOctree: collisionWorld.octree,
		model: gltf.scene,
		modelManifest: gltf.manifest,
		multiplayerBridge: null,
		playerDefense: createSimulationPlayerDefense(playerStats),
		playerGltf: gltf,
		playerStats,
		runToggle: false,
		scene,
		schedule: (delaySeconds, callback) => scheduler.schedule(delaySeconds, callback),
		scheduler,
		state: createSimulationPlayerState(),
		terrain: createSimulationTerrain()
	};
}

function addDefaultCollision(collisionWorld) {
	collisionWorld.addBox(
		{ x: 0, y: 1, z: 4 },
		{ x: 2.4, y: 2, z: 1 },
		'simulation-wall'
	);
}

function stepSimulationRuntime(runtime, deltaSeconds) {
	runtime.movement.update(deltaSeconds);
	runtime.importedAnimation.sample(runtime.state.action, runtime.equipment.weaponItemId);
	runtime.combat.update(deltaSeconds);
	runtime.playerActionSystem.update(deltaSeconds);
	runtime.enemies.update(deltaSeconds);
	for (const actor of runtime.friendlyActors) actor.update(deltaSeconds);
	runtime.scheduler.update(deltaSeconds);
	runtime.state.clip = runtime.importedAnimation.current;
	runtime.model.updateWorldMatrix?.();
}
