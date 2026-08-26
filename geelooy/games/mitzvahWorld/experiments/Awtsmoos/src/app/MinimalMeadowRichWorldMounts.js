// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichWorldMounts.js
 * @description Mounts current canonical meadow authorities concurrently before character and targeting details settle.
 * The Awtsmoos renews house, grass, tree, river, ridge, quest, and villager together without collapsing their contracts;
 * Awtsmoos.com calls each subsystem's living owner directly instead of preserving stale facade names.
 */

import { runMinimalMeadowConcurrentMountPlan } from './MinimalMeadowConcurrentMountPlan.js';
import { MinimalMeadowHousePopulation } from './MinimalMeadowHousePopulation.js';
import { MinimalMeadowMountainSystem } from './MinimalMeadowMountainSystem.js';
import { mountMinimalMeadowQuest } from './MinimalMeadowQuestMount.js';
import { MinimalMeadowTreeSystem } from './MinimalMeadowTreeSystem.js';
import { MinimalMeadowVegetationSystem } from './MinimalMeadowVegetationSystem.js';
import { MinimalMeadowWaterSystem } from './MinimalMeadowWaterSystem.js';
import {
	mountMinimalMeadowCharacter,
	mountMinimalMeadowSubsystem
} from './MinimalMeadowRichWorldMountSupport.js';
import { replaceMinimalMeadowWorldTargeting } from './MinimalMeadowWorldTargeting.js';

export async function mountMinimalMeadowRichWorld(runtime) {
	const mounted = await runMinimalMeadowConcurrentMountPlan({
		houses: () => mountMinimalMeadowSubsystem(runtime, 'houses', () => MinimalMeadowHousePopulation.create(runtime)),
		mountains: () => mountMinimalMeadowSubsystem(runtime, 'mountains', () => MinimalMeadowMountainSystem.create(runtime)),
		quest: () => mountMinimalMeadowQuest(runtime, runtime.environment || globalThis),
		trees: () => mountMinimalMeadowSubsystem(runtime, 'trees', () => MinimalMeadowTreeSystem.create(runtime)),
		vegetation: () => mountMinimalMeadowSubsystem(runtime, 'vegetation', () => new MinimalMeadowVegetationSystem(runtime)),
		water: () => mountMinimalMeadowSubsystem(runtime, 'water', () => MinimalMeadowWaterSystem.create(runtime))
	});
	const tailor = await mountMinimalMeadowCharacter(runtime, 'clothingMerchant', 'tailor');
	const amuletExpert = await mountMinimalMeadowCharacter(runtime, 'amuletExpert', 'amuletExpert');
	const targeting = replaceMinimalMeadowWorldTargeting(runtime);
	return {
		...mounted,
		amuletExpert,
		clothingMerchant: tailor,
		targeting
	};
}
