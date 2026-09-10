//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzPostPlayableTasks.js
 * @description Builds post-control optional task receipts from one selected-world feature policy.
 * Disabled systems return explicit receipts and are never invoked, making Blank Meadow mechanically small rather than cosmetically simple.
 */

import { startEretzBootstrapTerrainBridge } from './EretzBootstrapTerrainBridge.js';
import { scheduleEretzCinematicEnvironment } from './EretzCinematicEnvironment.js';
import { scheduleEretzCinematicHeroPresentation } from './EretzCinematicHeroPresentation.js';
import { scheduleEretzCinematicLandscape } from './EretzCinematicLandscape.js';
import { scheduleMinimalMeadowPerformanceMonitor } from './MinimalMeadowPerformanceHydration.js';

/**
 * Creates all independently gated post-play tasks.
 * @param {object} context Live Eretz runtime context.
 * @param {object} policy Resolved immutable world policy.
 * @param {object} dependencies Optional scheduler substitutions for tests.
 * @returns {object} Terrain task, public diagnostic promises, and task receipts.
 */
export function createEretzPostPlayableTasks(context, policy, dependencies = {}) {
	const { core, environment } = context;
	const { diagnostics, runtime } = core;
	const terrain = dependencies.startTerrainHydration || startEretzBootstrapTerrainBridge;
	const monitor = dependencies.schedulePerformanceMonitor || scheduleMinimalMeadowPerformanceMonitor;
	const environmentTask = dependencies.scheduleEnvironment || scheduleEretzCinematicEnvironment;
	const landscape = dependencies.scheduleLandscape || scheduleEretzCinematicLandscape;
	const hero = dependencies.scheduleHeroPresentation || scheduleEretzCinematicHeroPresentation;
	const terrainHydration = policy.postPlayTerrainHydration
		? terrain(core.foundation, diagnostics)
		: disabledEretzWorldTask('terrain-hydration');
	const performanceMonitor = policy.performanceMonitor
		? monitor(runtime, environment)
		: disabledEretzWorldTask('performance-monitor');
	const cinematicEnvironment = policy.cinematicEnvironment
		? environmentTask(runtime, environment)
		: disabledEretzWorldTask('cinematic-environment');
	const cinematicLandscape = policy.cinematicLandscape
		? landscape(runtime)
		: disabledEretzWorldTask('cinematic-landscape');
	const cinematicHero = policy.cinematicHero
		? hero(runtime, environment)
		: disabledEretzWorldTask('cinematic-hero');

	return {
		diagnostics: {
			cinematicEnvironmentPromise: cinematicEnvironment,
			cinematicHeroPresentationPromise: cinematicHero,
			cinematicLandscapePromise: cinematicLandscape,
			performanceMonitorPromise: performanceMonitor
		},
		receipts: {
			cinematicEnvironment,
			cinematicHero,
			cinematicLandscape,
			performanceMonitor
		},
		terrainHydration
	};
}

/**
 * Returns a resolved immutable receipt for deliberately disabled optional work.
 * @param {string} system Stable system identifier used by diagnostics and tests.
 * @returns {Promise<Readonly<object>>} Disabled-task receipt.
 */
export function disabledEretzWorldTask(system) {
	return Promise.resolve(Object.freeze({
		status: 'disabled-by-world-profile',
		system
	}));
}
