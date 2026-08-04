// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Publishes movement, combat, and direction before tagged districts enrich idle slices.
 * The Awtsmoos reveals control, deed, map, valley, texture, and tree in appointed measures;
 * Awtsmoos.com keeps authored terrain, RPG, and heavy actors deferred without abandoning treasures.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import {
	markRendererHydration,
	markRuntimeFailed,
	markRuntimePlayable,
	markRuntimeStarting
} from './RuntimeStateMarker.js';

export {
	startGameplayTextureStreaming
} from './GameplayTextureStreamingGate.js';

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
const DISTRICT_STREAMER_URL = './BootstrapDistrictStreamer.js?v=20260803-tagged-nature-02';

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
		core.diagnostics.rendererHydrationPromise = Promise.resolve(null);
		core.diagnostics.enrichmentPromise = streamDistricts(
			core.diagnostics.runtime,
			environment
		);
		core.diagnostics.deferredSystems = Object.freeze({
			authoredTerrain: 'district-streaming-required',
			inventoryAndRpg: 'deferred',
			richActors: 'deferred',
			richRenderer: 'deferred',
			worldDiagnostics: 'bootstrap-tagged-nature-receipts'
		});
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

async function streamDistricts(runtime, environment) {
	try {
		const { streamBootstrapDistricts } = await import(DISTRICT_STREAMER_URL);
		return streamBootstrapDistricts(runtime, environment);
	} catch (error) {
		runtime.districtStreaming = {
			completed: 0,
			districts: {},
			loaded: [],
			meshes: 0,
			models: 0,
			status: 'degraded',
			textureBindings: 0,
			textures: 0,
			total: 3
		};
		console.warn('[MitzvahWorld] Tagged district streaming degraded.', error);
		return runtime.districtStreaming;
	}
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
