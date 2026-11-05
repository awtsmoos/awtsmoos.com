// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayablePriority.js
 * @description Rich environment and player promotion after control, never gating the independent bridge trial.
 * The Awtsmoos holds the scenery and the traveler in His hand;
 * the bridge no longer waits for an optional painter of the land.
 */

import { startEretzCanonicalPlayerPromotion } from './EretzCanonicalPlayerPromotion.js';
import {
	destroyedEretzPostPlayableReceipt,
	eretzDeferredSystemReceipt,
	loadEretzPostPlayableLaunchers
} from './EretzPostPlayableLaunchers.js';
import { eretzPostPlayablePriorityPolicy, waitForCanonicalPlayerWindow } from './EretzPostPlayablePriorityClock.js';
import { disabledEretzWorldTask, createEretzPostPlayableTasks } from './EretzPostPlayableTasks.js';
import { resolveEretzPostPlayableWorldPolicy, simpleWorldPostPlayableReceipt } from './EretzPostPlayableWorldPolicy.js';

export { eretzPostPlayablePriorityPolicy, waitForCanonicalPlayerWindow };

/** Continues optional world richness without duplicating bridge startup or the player frame. */
export async function startEretzPostPlayablePriority(context, dependencies = {}) {
	const { core, environment, options } = context;
	const { diagnostics, runtime } = core;
	const policy = resolveEretzPostPlayableWorldPolicy(options);
	const tasks = createEretzPostPlayableTasks(context, policy, dependencies);

	diagnostics.worldExperience = policy;
	diagnostics.deferredSystems = eretzDeferredSystemReceipt(policy);
	Object.assign(diagnostics, tasks.diagnostics);
	if (runtime.destroyed) {
		return destroyedEretzPostPlayableReceipt(immediatePriority('runtime-destroyed'));
	}
	if (!policy.canonicalPromotion) {
		diagnostics.postPlayablePriorityStage = 'simple-world-ready';
		return simpleWorldPostPlayableReceipt(
			policy,
			immediatePriority('world-profile-simple'),
			tasks.terrainHydration,
			tasks.receipts
		);
	}

	diagnostics.postPlayablePriorityStage = 'starting-canonical-player';
	const startPlayer = dependencies.startPlayer || startEretzCanonicalPlayerPromotion;
	startPlayer(runtime, environment, dependencies.playerPromotion);
	diagnostics.postPlayablePriorityStage = 'waiting-for-canonical-player';
	const waitForPlayer = dependencies.waitForPlayer || waitForCanonicalPlayerWindow;
	const priority = await waitForPlayer(runtime, environment, options);
	if (runtime.destroyed) return destroyedEretzPostPlayableReceipt(priority);

	diagnostics.postPlayablePriorityStage = 'loading-world-launchers';
	const loadLaunchers = dependencies.loadLaunchers || loadEretzPostPlayableLaunchers;
	const launchers = await loadLaunchers();
	diagnostics.postPlayablePriorityStage = 'launching-world-streams';
	const districts = policy.districtStreaming
		? Promise.resolve(launchers.startDistrict(runtime, environment))
		: disabledEretzWorldTask('district-streaming');
	const enrichment = Promise.resolve(launchers.startDeferred(core, options, context.boot));
	diagnostics.postPlayablePriorityStage = 'launched';
	return Object.freeze({
		...tasks.receipts,
		districts,
		enrichment,
		policy,
		priority,
		status: 'launched',
		terrainHydration: tasks.terrainHydration
	});
}

/** Provides a deterministic receipt for intentionally lightweight worlds. */
function immediatePriority(reason) {
	return Object.freeze({ reason, waitedMs: 0 });
}
