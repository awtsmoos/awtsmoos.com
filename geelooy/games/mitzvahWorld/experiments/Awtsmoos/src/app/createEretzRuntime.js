// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Opens one bundled playable world, then streams optional enrichment afterward.
 * The Awtsmoos gathers the first living frame into one vessel; Awtsmoos.com replaces the old
 * six-hundred-module thunderclap with a single responsive bundle and later bounded streams.
 */

import { startGameplayTextureStreaming } from './GameplayTextureStreamingGate.js';
import { afterVisibleFrames, reportLaunchProgress } from './RuntimeLaunchProgress.js';

const PLAYABLE_BUNDLE_URL = '../../dist/playable-runtime/playable-runtime.js?v=20260722-bundle-08';

export { startGameplayTextureStreaming };

export async function createEretzRuntime(hosts, options = {}) {
	const { BootPhaseTracker } = await import('./BootPhaseTracker.js');
	const boot = new BootPhaseTracker();
	globalThis.AwtsmoosBootTracker = boot;
	try {
		boot.begin('playable-bundle');
		reportLaunchProgress(options, 'Loading the playable world bundle…', 0.08);
		const { createPlayableEretzRuntime } = await import(PLAYABLE_BUNDLE_URL);
		const core = await createPlayableEretzRuntime(hosts, options, boot);
		boot.complete();
		setDebugHudVisibility(hosts?.hud);
		publishRuntime(core.diagnostics);
		reportLaunchProgress(options, 'The world is playable; details are streaming in…', 1);
		core.diagnostics.enrichmentPromise = scheduleEnrichment({
			...core,
			boot,
			options
		});
		return core.diagnostics;
	} catch (error) {
		boot.fail(error);
		exposeBootFailure(error, hosts);
		throw error;
	} finally {
		if (globalThis.AwtsmoosBootTracker === boot) globalThis.AwtsmoosBootTracker = null;
	}
}

async function scheduleEnrichment(context) {
	try {
		await afterVisibleFrames(2, context.options.environment || globalThis);
		const { startEretzDeferredRuntimeEnrichment } = await import(
			'./EretzDeferredRuntimeEnrichment.js?v=20260722-stream-03'
		);
		return startEretzDeferredRuntimeEnrichment(context);
	} catch (error) {
		context.boot.degrade?.('deferred-enrichment', error);
		console.warn('[MitzvahWorld] Optional enrichment degraded.', error);
		return null;
	}
}

function publishRuntime(diagnostics) {
	if (typeof window === 'undefined') return;
	window.AwtsmoosBootError = null;
	window.AwtsmoosDiagnostics = diagnostics;
}

function exposeBootFailure(error, hosts) {
	const failure = {
		at: new Date().toISOString(),
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || ''
	};
	if (typeof window !== 'undefined') window.AwtsmoosBootError = failure;
	if (hosts?.hud) {
		hosts.hud.style.removeProperty('display');
		hosts.hud.textContent = `B"H world initialization failed: ${failure.message}`;
	}
	console.error('B"H Mitzvah World initialization failed.', error);
}

function setDebugHudVisibility(hud) {
	if (!hud || typeof location === 'undefined') return;
	hud.style.display = new URLSearchParams(location.search).get('debug') === '1' ? '' : 'none';
}

export default createEretzRuntime;
