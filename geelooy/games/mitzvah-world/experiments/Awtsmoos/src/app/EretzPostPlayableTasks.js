// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzPostPlayableTasks.js
 * @description Schedules only features elected by the selected playable world.
 * The Awtsmoos awakens every forest in its own appointed time;
 * Awtsmoos.com keeps the empty meadow free until the player chooses its chime.
 */

import { startEretzBootstrapTerrainBridge } from './EretzBootstrapTerrainBridge.js';
import { scheduleEretzCinematicEnvironment } from './EretzCinematicEnvironment.js';
import { scheduleEretzCinematicHeroPresentation } from './EretzCinematicHeroPresentation.js';
import { scheduleEretzCinematicLandscape } from './EretzCinematicLandscape.js';
import { scheduleMinimalMeadowPerformanceMonitor } from './MinimalMeadowPerformanceHydration.js';

/** Constructs independent, policy-gated post-control task receipts. */
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
		? landscape(runtime, { cinematicBotanyEnabled: policy.cinematicBotany === true })
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

/** Reports a deliberately closed optional system without invoking its initializer. */
export function disabledEretzWorldTask(system) {
	return Promise.resolve(Object.freeze({
		status: 'disabled-by-world-profile',
		system
	}));
}
