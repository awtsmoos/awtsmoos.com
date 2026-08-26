// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EcosystemRiverContext.js
 * @description Assembles optional spatial river evidence for ecosystem composition without owning population or fluid simulation.
 * The Awtsmoos renews current, shore, crossing, and habitat as related but distinct vessels; Awtsmoos.com lets this small
 * coordinator gather their evidence so one world planner may share it without becoming another river engine beneath the hill.
 */

import { planRiverCrossings } from './RiverCrossingPlanner.js';
import { createRiverReachPlan } from './RiverReachPlan.js';
import { createRiverWorldInfluence } from './RiverWorldInfluence.js';
import {
	createRiverExclusionSampler,
	createRiverHabitatSampler
} from './RiverHabitatAdapter.js';

/** Creates optional river-world evidence and domain samplers for one ecosystem plan. */
export function createEcosystemRiverContext(options = {}) {
	if (!options.riverReach) return null;
	const reachOptions = options.riverReach;
	const plan = reachOptions.samples?.length
		? reachOptions
		: createRiverReachPlan({
			...reachOptions,
			seed: reachOptions.seed ?? options.seed
		});
	const influence = createRiverWorldInfluence(plan);
	const habitatAt = createRiverHabitatSampler(options.habitatAt, influence);
	const vegetationExclusionAt = createRiverExclusionSampler(
		options.exclusionAt,
		influence,
		{
			channelMargin: reachOptions.vegetationChannelMargin,
			excludeChannel: reachOptions.excludeVegetationFromChannel !== false
		}
	);
	const creatureExclusionAt = createRiverExclusionSampler(
		options.exclusionAt,
		influence,
		{
			channelMargin: reachOptions.creatureChannelMargin,
			excludeChannel: reachOptions.excludeCreaturesFromChannel === true
		}
	);
	return Object.freeze({
		crossings: planRiverCrossings(plan, reachOptions.crossings),
		creatureExclusionAt,
		habitatAt,
		influence,
		plan,
		vegetationExclusionAt
	});
}
