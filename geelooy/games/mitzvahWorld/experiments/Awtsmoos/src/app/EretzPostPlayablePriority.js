//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayablePriority.js
 * @description Textures visible ground first, completes Simple Meadow immediately, and opens richer launchers only after the Mountain Village player-priority window.
 * The Awtsmoos clothes the earth before abundance can contend and lets a simple world rest at its honest shore;
 * Awtsmoos.com asks richer mountains to wait for the traveler, while Simple Meadow carries no needless delay through the door.
 */

import { startEretzBootstrapTerrainBridge } from './EretzBootstrapTerrainBridge.js';
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
	resolveEretzPostPlayableWorldPolicy,
	simpleWorldPostPlayableReceipt
} from './EretzPostPlayableWorldPolicy.js';

export {
	eretzPostPlayablePriorityPolicy,
	waitForCanonicalPlayerWindow
};

/** Starts the selected world's post-play lane without waiting or importing rich launchers for Simple Meadow. */
export async function startEretzPostPlayablePriority(context, dependencies = {}) {
	const { core, environment, options } = context;
	const runtime = core.runtime;
	const diagnostics = core.diagnostics;
	const policy = resolveEretzPostPlayableWorldPolicy(options);
	diagnostics.worldExperience = policy;
	diagnostics.deferredSystems = eretzDeferredSystemReceipt(policy);
	const terrainHydration = startEretzBootstrapTerrainBridge(
		core.foundation,
		diagnostics
	);
	if (runtime.destroyed) {
		return destroyedEretzPostPlayableReceipt(immediatePriority('runtime-destroyed'));
	}
	if (!policy.canonicalPromotion) {
		diagnostics.postPlayablePriorityStage = 'simple-world-ready';
		return simpleWorldPostPlayableReceipt(
			policy,
			immediatePriority('world-profile-simple'),
			terrainHydration
		);
	}
	diagnostics.postPlayablePriorityStage = 'waiting-for-canonical-player';
	const waitForPlayer = dependencies.waitForPlayer
		|| waitForCanonicalPlayerWindow;
	const priority = await waitForPlayer(runtime, environment, options);
	if (runtime.destroyed) {
		return destroyedEretzPostPlayableReceipt(priority);
	}
	diagnostics.postPlayablePriorityStage = 'loading-world-launchers';
	const loadLaunchers = dependencies.loadLaunchers
		|| loadEretzPostPlayableLaunchers;
	const launchers = await loadLaunchers();
	diagnostics.postPlayablePriorityStage = 'launching-world-streams';
	const districts = policy.districtStreaming
		? Promise.resolve(launchers.startDistrict(runtime, environment))
		: Promise.resolve(Object.freeze({ status: 'disabled-by-world-profile' }));
	const enrichment = Promise.resolve(
		launchers.startDeferred(core, options, context.boot)
	);
	diagnostics.postPlayablePriorityStage = 'launched';
	return Object.freeze({
		districts,
		enrichment,
		policy,
		priority,
		status: 'launched',
		terrainHydration
	});
}

/** Builds a zero-wait priority receipt for paths that intentionally require no canonical-player window. */
function immediatePriority(reason) {
	return Object.freeze({
		reason,
		waitedMs: 0
	});
}
