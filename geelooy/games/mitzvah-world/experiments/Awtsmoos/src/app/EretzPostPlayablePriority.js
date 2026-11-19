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
		// B"H: simple worlds never run the rich-feature chain (world systems
		// + optional hydration), so their neighbors never arrived — the
		// optional 'friendly' branch waits on a handoff promise that is
		// never created here. Install the meadow's own friendly Chossidim
		// directly, beside spawn, without blocking the receipt.
		const friendlyActors = startSimpleWorldFriendlyActors(
			runtime,
			environment,
			dependencies,
			diagnostics
		);
		return simpleWorldPostPlayableReceipt(
			policy,
			immediatePriority('world-profile-simple'),
			tasks.terrainHydration,
			{ ...tasks.receipts, friendlyActors }
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

/**
 * Installs the simple world's own friendly neighbors without blocking the
 * receipt. The installer is lazy-imported so the foundation bundle stays
 * lean; a failure settles as a receipt, never as a broken world.
 */
function startSimpleWorldFriendlyActors(runtime, environment, dependencies, diagnostics) {
	const install = dependencies.installSimpleWorldFriendlyNpcs
		|| installSimpleWorldFriendlyNpcs;
	diagnostics.simpleWorldFriendlyActorsStage = 'installing';
	return Promise.resolve()
		.then(() => install(runtime, environment))
		.then(result => {
			diagnostics.simpleWorldFriendlyActorsStage = 'ready';
			return result;
		})
		.catch(error => {
			diagnostics.simpleWorldFriendlyActorsStage = 'failed';
			diagnostics.simpleWorldFriendlyActorsError = error?.message || String(error);
			return Object.freeze({
				reason: error?.message || String(error),
				status: 'simple-world-friendly-actors-failed'
			});
		});
}

async function installSimpleWorldFriendlyNpcs(runtime, environment) {
	const module = await import('./MinimalMeadowFriendlyNpcs.js');
	return module.installMinimalMeadowFriendlyNpcs(runtime, environment);
}
