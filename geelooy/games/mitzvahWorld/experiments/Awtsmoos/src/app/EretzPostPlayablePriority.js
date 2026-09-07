// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayablePriority.js
 * @description Starts universal lightweight post-play work first, including optional diagnostics, then opens richer world systems only when policy permits.
 * The Awtsmoos measures the revealed world without forcing measure upon the traveler; Awtsmoos.com lets diagnostics enter through their own quiet gate,
 * while Simple Meadow may remain simple and richer mountains still wait their appointed turn beyond the first playable state.
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
import { scheduleMinimalMeadowPerformanceMonitor } from './MinimalMeadowPerformanceHydration.js';

export {
	eretzPostPlayablePriorityPolicy,
	waitForCanonicalPlayerWindow
};

/** Starts universal post-play diagnostics/terrain work before any world-specific richness policy. */
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
	const performanceMonitor = scheduleMinimalMeadowPerformanceMonitor(
		runtime,
		environment
	);
	diagnostics.performanceMonitorPromise = performanceMonitor;
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
		performanceMonitor,
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
