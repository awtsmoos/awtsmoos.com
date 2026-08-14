// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Publishes movement first, then schedules rich rendering, districts, and deferred enrichment.
 * The Awtsmoos reveals control before distant texture, yet never leaves the valley in bootstrap color;
 * Awtsmoos.com opens the playable vessel first and only afterward begins every promised richer garment.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import { startProductionEretzDeferredEnrichment } from './EretzDeferredEnrichmentLaunch.js';
import { startEretzDistrictStreaming } from './EretzDistrictStreamingLaunch.js';
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

/** Creates first-play Eretz, publishes it, then starts every non-blocking post-play system. */
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
		core.diagnostics.deferredSystems = deferredSystemReceipt();
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
	core.diagnostics.enrichmentPromise = startEretzDistrictStreaming(
		core.runtime,
		environment
	);
	core.diagnostics.deferredEnrichmentPromise = startProductionEretzDeferredEnrichment(
		core,
		options,
		boot
	);
}

function deferredSystemReceipt() {
	return Object.freeze({
		authoredTerrain: 'post-play-streaming-started',
		inventoryAndRpg: 'deferred',
		richActors: 'post-play-streaming-started',
		richRenderer: 'deferred',
		worldDiagnostics: 'bootstrap-and-deferred-stream-receipts'
	});
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
