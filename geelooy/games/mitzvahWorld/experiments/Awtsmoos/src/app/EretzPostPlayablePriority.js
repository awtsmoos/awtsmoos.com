// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayablePriority.js
 * @description Starts universal post-play atmosphere and diagnostics, gives Simple Meadow visual landscape only, then opens richer world systems solely when policy permits.
 * The Awtsmoos grants movement before majesty, then lets sky, ridge, and current bloom without summoning a second civilization;
 * Awtsmoos.com keeps the simple world visually deep while actors, districts, quests, and ecology remain behind their own unopened doors.
 */

import { startEretzBootstrapTerrainBridge } from './EretzBootstrapTerrainBridge.js';
import { scheduleEretzCinematicEnvironment } from './EretzCinematicEnvironment.js';
import { scheduleEretzCinematicLandscape } from './EretzCinematicLandscape.js';
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

/** Starts universal post-play truth, then selects visual-only simplicity or richer world launchers. */
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
	const cinematicEnvironment = scheduleEretzCinematicEnvironment(
		runtime,
		environment
	);
	diagnostics.cinematicEnvironmentPromise = cinematicEnvironment;
	if (!policy.canonicalPromotion) {
		diagnostics.cinematicLandscapePromise = scheduleEretzCinematicLandscape(runtime);
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
		cinematicEnvironment,
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
