// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Publishes movement first, then dynamically joins every post-play richness path.
 * The Awtsmoos reveals control before distant valley garments contend for the same breath;
 * Awtsmoos.com keeps first play light, then orders Chossid, districts, actors, and richness without theft.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { startEretzRendererHydration } from './EretzRendererHydrationLaunch.js';
import {
	markRendererHydration,
	markRuntimeFailed,
	markRuntimePlayable,
	markRuntimeStarting
} from './RuntimeStateMarker.js';

export { startGameplayTextureStreaming } from './GameplayTextureStreamingGate.js';

const TRACKER_URL = resolveDeferredAppModuleUrl(
	'BootPhaseTracker.js?v=20260722-boot-text-01',
	import.meta.url,
	'createEretzRuntime.js'
);
const STAGED_RUNTIME_URL = resolveDeferredAppModuleUrl(
	'EretzStagedRuntime.js?v=20260804-map-01',
	import.meta.url,
	'createEretzRuntime.js'
);
const POST_PLAYABLE_URL = resolveDeferredAppModuleUrl(
	'EretzPostPlayablePriority.js?v=20260820-player-priority-02',
	import.meta.url,
	'createEretzRuntime.js'
);

/** Creates first-play Eretz, publishes it, then starts non-blocking post-play systems. */
export async function createEretzRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	markRuntimeStarting(environment.document);
	const { BootPhaseTracker } = await import(TRACKER_URL);
	const boot = new BootPhaseTracker(undefined, environment);
	globalThis.AwtsmoosBootTracker = boot;
	try {
		boot.begin('staged-webgl-runtime');
		const { createStagedEretzRuntime } = await import(STAGED_RUNTIME_URL);
		const core = await createStagedEretzRuntime(hosts, options, boot);
		boot.complete();
		publishRuntime(core.diagnostics, environment);
		markRendererHydration('deferred', environment.document);
		core.diagnostics.rendererHydrationPromise = startEretzRendererHydration(
			core.diagnostics,
			environment,
			boot,
			{ signal: options.signal || null }
		);
		startPostPlayableStreams(core, options, boot, environment);
		return core.diagnostics;
	} catch (error) {
		boot.fail(error);
		exposeBootFailure(error, hosts, environment);
		throw error;
	} finally {
		if (globalThis.AwtsmoosBootTracker === boot) {
			globalThis.AwtsmoosBootTracker = null;
		}
	}
}

function startPostPlayableStreams(core, options, boot, environment) {
	const diagnostics = core.diagnostics;
	diagnostics.postPlayablePriorityStage = 'loading-module';
	const coordinator = import(POST_PLAYABLE_URL)
		.then(module => module.startEretzPostPlayablePriority({
			boot,
			core,
			environment,
			options
		}))
		.catch(error => degradedPostPlayablePriority(diagnostics, error));
	diagnostics.postPlayablePriorityPromise = coordinator;
	diagnostics.enrichmentPromise = coordinator.then(receipt => receipt?.districts ?? null);
	diagnostics.deferredEnrichmentPromise = coordinator.then(receipt => receipt?.enrichment ?? null);
}

function degradedPostPlayablePriority(diagnostics, error) {
	diagnostics.postPlayablePriorityError = error;
	diagnostics.postPlayablePriorityStage = 'degraded';
	console.warn('[MitzvahWorld] Post-play priority coordinator degraded.', error);
	return null;
}

function publishRuntime(diagnostics, environment) {
	environment.AwtsmoosBootError = null;
	environment.AwtsmoosDiagnostics = diagnostics;
	markRuntimePlayable(diagnostics, environment.document);
}

function exposeBootFailure(error, hosts, environment) {
	const failure = {
		at: new Date().toISOString(),
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || ''
	};
	environment.AwtsmoosBootError = failure;
	markRuntimeFailed(error, environment.document);
	if (hosts?.hud) {
		hosts.hud.style.removeProperty('display');
		hosts.hud.textContent = `B"H world initialization failed: ${failure.message}`;
	}
	console.error('B"H Mitzvah World initialization failed.', error);
}

export default createEretzRuntime;
