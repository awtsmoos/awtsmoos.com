// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorld.js
 * @description Adds water, forest, flowers, houses, NPCs, and quests after combat is playable.
 * The Awtsmoos lets distant detail descend into an already living valley;
 * Awtsmoos.com preserves enemy casting while richer populations join one renewed target owner.
 */

import { WorldTargetCoordinator } from '../ui/WorldTargetCoordinator.js';
import { MinimalMeadowQuestParchment } from '../ui/MinimalMeadowQuestParchment.js';
import { MinimalMeadowHousePopulation } from './MinimalMeadowHousePopulation.js';
import { MinimalMeadowQuestNpcPopulation } from './MinimalMeadowQuestNpcPopulation.js';
import { MinimalMeadowQuestState } from './MinimalMeadowQuestState.js';
import { MinimalMeadowTreeSystem } from './MinimalMeadowTreeSystem.js';
import { MinimalMeadowVegetationSystem } from './MinimalMeadowVegetationSystem.js';
import { MinimalMeadowWaterSystem } from './MinimalMeadowWaterSystem.js';

/**
 * Installs noncritical world richness without taking ownership of the first playable frame.
 * @param {object} runtime Active meadow runtime with combat enemies already mounted.
 * @param {Window|object} environment Browser-like environment.
 * @returns {Promise<object>} Rich-world diagnostics receipt.
 */
export async function installMinimalMeadowRichWorld(runtime, environment = globalThis) {
	await installEnvironment(runtime);
	runtime.houses = await MinimalMeadowHousePopulation.create(runtime);
	runtime.scene.add(runtime.houses.group);
	runtime.quest = new MinimalMeadowQuestState(runtime);
	runtime.friendlyNpcs = new MinimalMeadowQuestNpcPopulation(runtime, runtime.quest);
	runtime.scene.add(runtime.friendlyNpcs.group);
	runtime.questUi = new MinimalMeadowQuestParchment(
		runtime.quest,
		runtime.bus,
		environment.document
	);
	replaceTargetCoordinator(runtime);
	const receipt = diagnostics(runtime);
	runtime.bus.emit('world:rich-ready', receipt);
	return receipt;
}

async function installEnvironment(runtime) {
	runtime.water = await MinimalMeadowWaterSystem.create(runtime);
	runtime.trees = await MinimalMeadowTreeSystem.create(runtime);
	runtime.vegetation = new MinimalMeadowVegetationSystem(runtime);
	for (const system of [runtime.water, runtime.trees, runtime.vegetation]) {
		runtime.scene.add(system.group);
	}
}

function replaceTargetCoordinator(runtime) {
	runtime.targeting?.destroy?.();
	runtime.targeting = new WorldTargetCoordinator({
		canvas: runtime.hosts.canvas,
		populations: [runtime.friendlyNpcs, runtime.enemies, runtime.houses]
	});
}

function diagnostics(runtime) {
	return {
		friendly: runtime.friendlyNpcs?.diagnostics?.() || null,
		houses: runtime.houses?.diagnostics?.() || null,
		quest: runtime.quest?.snapshot?.() || null,
		targeting: runtime.targeting?.diagnostics?.() || null,
		trees: runtime.trees?.diagnostics?.() || null,
		vegetation: runtime.vegetation?.diagnostics?.() || null,
		water: runtime.water?.diagnostics?.() || null
	};
}

export default installMinimalMeadowRichWorld;
