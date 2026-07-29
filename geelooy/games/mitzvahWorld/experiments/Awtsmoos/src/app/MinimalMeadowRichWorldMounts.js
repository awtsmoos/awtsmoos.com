// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorldMounts.js
 * @description Starts every independent rich-world system together and gathers named receipts.
 * The Awtsmoos renews river, forest, home, neighbor, and market in one appointed moment;
 * Awtsmoos.com keeps the coordinator small while each subsystem preserves its own covenant.
 */

import {
	runMinimalMeadowConcurrentMountPlan
} from './MinimalMeadowConcurrentMountPlan.js';
import { MinimalMeadowClothingMerchantPopulation } from './MinimalMeadowClothingMerchantPopulation.js';
import { MinimalMeadowHousePopulation } from './MinimalMeadowHousePopulation.js';
import { mountMinimalMeadowQuest } from './MinimalMeadowQuestMount.js';
import {
	initializeMinimalMeadowMountStatus,
	mountMinimalMeadowSubsystem
} from './MinimalMeadowRichWorldMountSupport.js';
import { MinimalMeadowTreeSystem } from './MinimalMeadowTreeSystem.js';
import { MinimalMeadowVegetationSystem } from './MinimalMeadowVegetationSystem.js';
import { MinimalMeadowWaterSystem } from './MinimalMeadowWaterSystem.js';
import { replaceMinimalMeadowWorldTargeting } from './MinimalMeadowWorldTargeting.js';

export async function mountMinimalMeadowRichWorld(
	runtime,
	environment = globalThis
) {
	initializeMinimalMeadowMountStatus(runtime);
	const mounts = await runMinimalMeadowConcurrentMountPlan({
		houses: () => mountMinimalMeadowSubsystem(
			runtime,
			'houses',
			() => MinimalMeadowHousePopulation.create(runtime)
		),
		quest: () => runtime.questStore
			? Promise.resolve({ name: 'quest', status: 'ready' })
			: mountMinimalMeadowQuest(runtime, environment),
		tailor: () => mountMinimalMeadowSubsystem(
			runtime,
			'clothingMerchant',
			() => MinimalMeadowClothingMerchantPopulation.create(
				runtime,
				environment
			)
		),
		trees: () => mountMinimalMeadowSubsystem(
			runtime,
			'trees',
			() => MinimalMeadowTreeSystem.create(runtime)
		),
		vegetation: () => mountMinimalMeadowSubsystem(
			runtime,
			'vegetation',
			() => new MinimalMeadowVegetationSystem(runtime)
		),
		water: () => mountMinimalMeadowSubsystem(
			runtime,
			'water',
			() => MinimalMeadowWaterSystem.create(runtime)
		)
	});
	mounts.targeting = replaceMinimalMeadowWorldTargeting(runtime);
	runtime.richWorldMountStatus.phase = 'settled';
	return mounts;
}

export {
	mountMinimalMeadowSubsystem as mountSubsystem
} from './MinimalMeadowRichWorldMountSupport.js';
