// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldSystems.js
 * @description Installs houses, quest giver, six demons, one target stream, and both combats.
 * The Awtsmoos gathers dwelling, threshold, neighbor, trial, corpse, loot, spell, and sunlight;
 * Awtsmoos.com keeps every population inspectable while one pointer arbitrates all visible choice.
 */

import { WorldTargetCoordinator } from '../ui/WorldTargetCoordinator.js';
import { MinimalMeadowQuestParchment } from '../ui/MinimalMeadowQuestParchment.js?v=20260724-meadow-17';
import { MinimalMeadowCombat } from './MinimalMeadowCombat.js?v=20260723-meadow-11';
import { MinimalMeadowEnemyPopulation } from './MinimalMeadowEnemyPopulation.js?v=20260724-meadow-17';
import { MinimalMeadowHousePopulation } from './MinimalMeadowHousePopulation.js?v=20260724-meadow-17';
import { compileMinimalShadowCreature } from './MinimalMeadowProceduralCreature.js?v=20260723-meadow-10';
import { MinimalMeadowQuestNpcPopulation } from './MinimalMeadowQuestNpcPopulation.js?v=20260724-meadow-17';
import { MinimalMeadowQuestState } from './MinimalMeadowQuestState.js?v=20260724-meadow-17';
import { installMinimalMeadowSky } from './MinimalMeadowSky.js?v=20260723-meadow-11';

export async function installMinimalMeadowWorldSystems(runtime, environment = globalThis) {
	runtime.sky = installMinimalMeadowSky(runtime.scene, runtime.camera, 'high');
	runtime.houses = await MinimalMeadowHousePopulation.create(runtime);
	runtime.scene.add(runtime.houses.group);
	const compiled = await compileMinimalShadowCreature();
	runtime.enemies = new MinimalMeadowEnemyPopulation(enemyOptions(runtime, compiled, environment));
	runtime.scene.add(runtime.enemies.group);
	runtime.quest = new MinimalMeadowQuestState(runtime);
	runtime.friendlyNpcs = new MinimalMeadowQuestNpcPopulation(runtime, runtime.quest);
	runtime.scene.add(runtime.friendlyNpcs.group);
	runtime.questUi = new MinimalMeadowQuestParchment(runtime.quest, runtime.bus, environment.document);
	runtime.targeting = new WorldTargetCoordinator({
		canvas: runtime.hosts.canvas,
		populations: [runtime.friendlyNpcs, runtime.enemies, runtime.houses]
	});
	runtime.combat = new MinimalMeadowCombat(runtime);
	const receipt = diagnostics(runtime);
	runtime.bus.emit('world:systems-ready', receipt);
	return receipt;
}

export function updateMinimalMeadowWorldSystems(runtime, deltaSeconds) {
	runtime.sky?.update?.();
	runtime.houses?.update(deltaSeconds);
	runtime.enemies?.update(deltaSeconds);
	runtime.combat?.update(deltaSeconds);
}

export function destroyMinimalMeadowWorldSystems(runtime) {
	runtime.targeting?.destroy?.();
	runtime.enemies?.clearAll?.();
	runtime.houses?.destroy?.();
	runtime.friendlyNpcs?.destroy?.();
	runtime.questUi?.destroy?.();
	runtime.quest?.destroy?.();
	runtime.enemies?.group?.parent?.remove(runtime.enemies.group);
	for (const unsubscribe of runtime.combat?.unsubscribers || []) unsubscribe();
}

function enemyOptions(runtime, compiled, environment) {
	return {
		bus: runtime.bus,
		camera: runtime.camera,
		canvas: runtime.hosts.canvas,
		compiled,
		documentValue: environment.document,
		runtime,
		terrain: runtime.terrain
	};
}

function diagnostics(runtime) {
	return {
		combat: runtime.combat?.diagnostics?.() || null,
		enemies: runtime.enemies?.diagnostics?.() || null,
		friendly: runtime.friendlyNpcs?.diagnostics?.() || null,
		houses: runtime.houses?.diagnostics?.() || null,
		quest: runtime.quest?.snapshot?.() || null,
		sky: runtime.sky?.diagnostics?.() || null,
		targeting: runtime.targeting?.diagnostics?.() || null
	};
}
