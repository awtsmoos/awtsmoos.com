//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzPostPlayablePriority.js
 * @description Opens only the post-control systems permitted by the selected immutable world policy.
 * Blank Meadow stops intentionally after first-play essentials, while richer worlds progress through canonical and regional gates.
 */

import {
	destroyedEretzPostPlayableReceipt,
	eretzDeferredSystemReceipt,
	loadEretzPostPlayableLaunchers
} from './EretzPostPlayableLaunchers.js';
import {
	eretzPostPlayablePriorityPolicy,
	waitForCanonicalPlayerWindow
} from './EretzPostPlayablePriorityClock.js';
import {
	disabledEretzWorldTask,
	createEretzPostPlayableTasks
} from './EretzPostPlayableTasks.js';
import {
	resolveEretzPostPlayableWorldPolicy,
	simpleWorldPostPlayableReceipt
} from './EretzPostPlayableWorldPolicy.js';

export { eretzPostPlayablePriorityPolicy, waitForCanonicalPlayerWindow };

/**
 * Starts post-control work without allowing disabled optional systems to execute.
 * @param {object} context Live runtime context.
 * @param {object} dependencies Optional test/runtime substitutions.
 * @returns {Promise<Readonly<object>>} Post-play scheduling receipt.
 */
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
	const enrichment = Promise.resolve(
		launchers.startDeferred(core, options, context.boot)
	);

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

function immediatePriority(reason) {
	return Object.freeze({ reason, waitedMs: 0 });
}
