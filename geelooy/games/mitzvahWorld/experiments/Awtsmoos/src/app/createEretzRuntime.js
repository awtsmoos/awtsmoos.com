// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Publishes movement through the staged runtime before renderer enrichment and every later optional stream.
 * The Awtsmoos creates the living first frame before its ornaments; Awtsmoos.com keeps the hot graph narrow so quality, foundation,
 * and core reach control without dragging tomorrow's texture, renderer, or presentation garments through today's doorway.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import {
	markRuntimeFailed,
	markRuntimePlayable,
	markRuntimeStarting
} from './RuntimeStateMarker.js';

const TRACKER_URL = deferred('BootPhaseTracker.js?v=20260722-boot-text-01');
const STAGED_RUNTIME_URL = deferred('EretzStagedRuntime.js?v=20260908-current-hot-path-03');
const RENDERER_POLICY_URL = deferred('EretzRendererWorldPolicy.js?v=20260908-current-hot-path-03');
const POST_PLAYABLE_URL = deferred('EretzPostPlayablePriority.js?v=20260908-current-hot-path-03');

/** Creates first-play Eretz, publishes it, then starts every richer system without awaiting it. */
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
		startRendererAfterPlay(core.diagnostics, environment, boot, options);
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

/** Loads rich-renderer policy only after playable state has been published. */
function startRendererAfterPlay(diagnostics, environment, boot, options) {
	diagnostics.rendererHydrationStage = 'loading-policy';
	const promise = import(RENDERER_POLICY_URL)
		.then(module => module.startEretzRendererByWorldPolicy(
			diagnostics,
			environment,
			boot,
			options
		))
		.catch(error => {
			diagnostics.rendererHydrationStage = 'degraded';
			diagnostics.rendererHydrationError = error;
			return null;
		});
	diagnostics.rendererHydrationPromise = promise;
}

/** Starts diagnostics, landscape, character, and enrichment policy after first playable publication. */
function startPostPlayableStreams(core, options, boot, environment) {
	const diagnostics = core.diagnostics;
	diagnostics.postPlayablePriorityStage = 'loading-module';
	const coordinator = import(POST_PLAYABLE_URL)
		.then(module => module.startEretzPostPlayablePriority({ boot, core, environment, options }))
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

/** Makes the already-live runtime discoverable before any optional aftercare import. */
function publishRuntime(diagnostics, environment) {
	environment.AwtsmoosBootError = null;
	environment.AwtsmoosDiagnostics = diagnostics;
	markRuntimePlayable(diagnostics, environment.document);
}

/** Publishes a bounded failure receipt without hiding the exact original error. */
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

/** Resolves one deferred authored module relative to this hot-path owner. */
function deferred(specifier) {
	return resolveDeferredAppModuleUrl(specifier, import.meta.url, 'createEretzRuntime.js');
}

export default createEretzRuntime;
