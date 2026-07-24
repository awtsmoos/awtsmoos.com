// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorldMounts.js
 * @description Mounts water, trees, houses, quest Chossid, clothing tailor, and targeting.
 * The Awtsmoos renews river, home, forest, neighbor, and honest market through distinct vessels;
 * Awtsmoos.com records each failure without replacing canonical GLB actors with primitive blocks.
 */

import { MinimalMeadowQuestParchment } from '../ui/MinimalMeadowQuestParchment.js';
import { MinimalMeadowClothingMerchantPopulation } from './MinimalMeadowClothingMerchantPopulation.js';
import { MinimalMeadowHousePopulation } from './MinimalMeadowHousePopulation.js';
import { MinimalMeadowQuestNpcPopulation } from './MinimalMeadowQuestNpcPopulation.js';
import { MinimalMeadowQuestState } from './MinimalMeadowQuestState.js';
import { MinimalMeadowTreeSystem } from './MinimalMeadowTreeSystem.js';
import { MinimalMeadowVegetationSystem } from './MinimalMeadowVegetationSystem.js';
import { MinimalMeadowWaterSystem } from './MinimalMeadowWaterSystem.js';
import { replaceMinimalMeadowWorldTargeting } from './MinimalMeadowWorldTargeting.js';

export async function mountMinimalMeadowRichWorld(runtime, environment = globalThis) {
	const mounts = {};
	mounts.water = await mountSubsystem(runtime, 'water', () => MinimalMeadowWaterSystem.create(runtime));
	mounts.trees = await mountSubsystem(runtime, 'trees', () => MinimalMeadowTreeSystem.create(runtime));
	mounts.vegetation = await mountSubsystem(runtime, 'vegetation', () => new MinimalMeadowVegetationSystem(runtime));
	mounts.houses = await mountSubsystem(runtime, 'houses', () => MinimalMeadowHousePopulation.create(runtime));
	mounts.quest = await mountQuest(runtime, environment);
	mounts.tailor = await mountSubsystem(runtime, 'clothingMerchant', () =>
		MinimalMeadowClothingMerchantPopulation.create(runtime, environment)
	);
	mounts.targeting = replaceMinimalMeadowWorldTargeting(runtime);
	return mounts;
}

export async function mountSubsystem(runtime, name, factory) {
	try {
		const system = await factory();
		runtime[name] = system;
		if (system?.group && !system.group.parent) runtime.scene.add(system.group);
		return { diagnostics: system?.diagnostics?.() || null, name, status: 'ready' };
	} catch (error) {
		return subsystemFailure(runtime, name, error);
	}
}

async function mountQuest(runtime, environment) {
	try {
		runtime.quest = new MinimalMeadowQuestState(runtime);
		runtime.friendlyNpcs = await MinimalMeadowQuestNpcPopulation.create(runtime, runtime.quest);
		if (runtime.friendlyNpcs.group && !runtime.friendlyNpcs.group.parent) runtime.scene.add(runtime.friendlyNpcs.group);
		if (environment.document) {
			runtime.questUi = new MinimalMeadowQuestParchment(runtime.quest, runtime.bus, environment.document);
		}
		return { diagnostics: runtime.friendlyNpcs.diagnostics(), status: 'ready' };
	} catch (error) {
		return subsystemFailure(runtime, 'quest', error);
	}
}

function subsystemFailure(runtime, name, error) {
	const message = error?.message || String(error);
	runtime[`${name}Error`] = message;
	runtime.richWorldFailures ||= {};
	runtime.richWorldFailures[name] = message;
	runtime.bus.emit('world:subsystem-failed', { error: message, name });
	return { error: message, name, status: 'failed' };
}
