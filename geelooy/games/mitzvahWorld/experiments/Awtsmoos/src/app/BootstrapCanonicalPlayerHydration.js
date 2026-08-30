// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCanonicalPlayerHydration.js
 * @description Keeps canonical-player hydration deferred while preserving its original app-relative URL after CompactJS relocation.
 * The Awtsmoos carries one living path through readable source and gathered bundle alike;
 * Awtsmoos.com restores the app doorway before the canonical Chossid descends, so a changed vessel never makes the browser seek light in the wrong site.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';

const HYDRATOR_SPECIFIER = 'MinimalMeadowPlayerHydration.js?v=20260820-promise-cycle-01';
const SOURCE_FILE_NAME = 'BootstrapCanonicalPlayerHydration.js';

/** Resolves the canonical-player hydrator from readable source or the relocated compact core bundle. */
export function canonicalPlayerHydratorUrl(executingModuleUrl = import.meta.url) {
	return resolveDeferredAppModuleUrl(
		HYDRATOR_SPECIFIER,
		executingModuleUrl,
		SOURCE_FILE_NAME
	);
}

export function scheduleBootstrapCanonicalPlayerHydration(
	runtime,
	foundation,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.canonicalPlayer?.status === 'ready') {
		return Promise.resolve(runtime.canonicalPlayer);
	}
	if (runtime.canonicalPlayerLaunchPromise) {
		return runtime.canonicalPlayerLaunchPromise;
	}
	const waitForReady = dependencies.waitForReady || waitForControlReady;
	const nextFrame = dependencies.nextFrame || waitForPlayableFrame;
	const hydratorUrl = dependencies.hydratorUrl
		|| canonicalPlayerHydratorUrl();
	const importHydrator = dependencies.importHydrator
		|| (() => import(hydratorUrl));
	runtime.canonicalPlayerHydrationStage = 'waiting-for-control';
	const launchPromise = Promise.resolve(waitForReady(environment))
		.then(() => {
			runtime.canonicalPlayerHydrationStage = 'waiting-for-playable-frame';
			return nextFrame(environment);
		})
		.then(async () => {
			if (runtime.destroyed) return null;
			runtime.canonicalPlayerHydrationStage = 'loading-module';
			const module = await importHydrator();
			runtime.canonicalPlayerHydrationStage = 'loading-canonical-player';
			return module.hydrateMinimalMeadowPlayer(
				runtime,
				environment,
				foundation.playerHydrationDependencies || {}
			);
		})
		.then(result => finalizeStage(runtime, result))
		.catch(error => degradeCanonicalHydration(runtime, environment, error));
	runtime.canonicalPlayerLaunchPromise = launchPromise;
	return launchPromise;
}

function waitForControlReady(environment) {
	if (!environment?.document && !environment?.AwtsmoosBootPhases) {
		return Promise.resolve();
	}
	if (controlReady(environment)) return Promise.resolve();
	return new Promise(resolve => {
		const poll = () => {
			if (controlReady(environment)) return resolve();
			if (typeof environment.requestAnimationFrame === 'function') {
				environment.requestAnimationFrame(poll);
				return;
			}
			environment.setTimeout?.(poll, 16);
		};
		poll();
	});
}

function controlReady(environment) {
	return environment?.AwtsmoosBootPhases?.current === 'ready'
		|| environment?.document?.documentElement?.dataset?.awtsmoosBootPhase === 'ready';
}

function waitForPlayableFrame(environment) {
	if (typeof environment?.requestAnimationFrame === 'function') {
		return new Promise(resolve => environment.requestAnimationFrame(() => resolve()));
	}
	return new Promise(resolve => environment?.setTimeout?.(resolve, 0) ?? resolve());
}

function finalizeStage(runtime, result) {
	runtime.canonicalPlayerHydrationStage = result
		? 'ready'
		: runtime.destroyed ? 'destroyed' : runtime.canonicalPlayer?.status || 'fallback-visible';
	return result;
}

function degradeCanonicalHydration(runtime, environment, error) {
	runtime.canonicalPlayerHydrationError = error?.message || String(error);
	runtime.canonicalPlayerHydrationStage = 'degraded';
	environment.console?.warn?.('[MitzvahWorld] deferred canonical Chossid hydration failed.', error);
	return null;
}
