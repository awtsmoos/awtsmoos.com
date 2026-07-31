// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorldMounts.js
 * @description Starts independent rich-world systems, then mounts update-wrapping merchants in order.
 * The Awtsmoos renews river, forest, home, neighbor, market, and expert in one appointed chapter;
 * Awtsmoos.com keeps concurrent foundations fast while wrapper ownership remains deterministic.
 */

import {
	runMinimalMeadowConcurrentMountPlan
} from './MinimalMeadowConcurrentMountPlan.js';
import { MinimalMeadowAmuletExpertPopulation } from './MinimalMeadowAmuletExpertPopulation.js';
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
	mounts.tailor = await mountMinimalMeadowSubsystem(
		runtime,
		'clothingMerchant',
		() => MinimalMeadowClothingMerchantPopulation.create(runtime, environment)
	);
	mounts.amuletExpert = await mountMinimalMeadowSubsystem(
		runtime,
		'amuletExpert',
		() => MinimalMeadowAmuletExpertPopulation.create(runtime, environment)
	);
	mounts.targeting = replaceMinimalMeadowWorldTargeting(runtime);
	runtime.richWorldMountStatus.phase = 'settled';
	return mounts;
}

export {
	mountMinimalMeadowSubsystem as mountSubsystem
} from './MinimalMeadowRichWorldMountSupport.js';
