// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Publishes the playable valley before every optional enrichment begins.
 * The Awtsmoos awakens movement before distant leaves and models; Awtsmoos.com preserves
 * one ordered covenant from foundation through actors, diagnostics, loop, and streaming.
 */

import { MitzvahWorldLocalRpgSession } from '../network/MitzvahWorldLocalRpgSession.js';
import { installRuntimePerformanceMonitor } from '../performance/RuntimePerformanceMonitor.js';
import { resolveWorldQuality } from '../performance/WorldQualityProfile.js';
import { startEretzActorHydration } from './EretzActorHydration.js?v=20260720-canonical-valley-pass-05';
import { BootPhaseTracker } from './BootPhaseTracker.js';
import { createEretzActors } from './EretzActorSystem.js?v=20260720-canonical-valley-pass-04';
import {
	startEretzPostMovementStreaming,
	startGameplayTextureStreaming
} from './EretzPostMovementStreaming.js';
import { attachRuntimeDiagnostics } from './EretzRuntimeDiagnostics.js';
import { startEretzRuntime } from './EretzRuntimeLoop.js';
import { createEretzUi } from './EretzUiSystem.js?v=20260720-canonical-valley-pass-06';
import { installViewport } from './EretzViewport.js';
import { createEretzWorldFoundation } from './EretzWorldFoundation.js?v=20260720-canonical-valley-pass-04';
import { installWorldDiagnostics } from './WorldDiagnostics.js';

export { startGameplayTextureStreaming };

export async function createEretzRuntime(hosts, options = {}) {
	const boot = new BootPhaseTracker();
	const qualityProfile = resolveWorldQuality(options);
	globalThis.AwtsmoosBootTracker = boot;
	try {
		boot.begin('world-foundation');
		const foundation = await createEretzWorldFoundation(hosts, {
			...options,
			qualityProfile
		});
		boot.begin('actors-and-interface');
		const actors = createEretzActors(foundation);
		const runtime = createEretzUi(actors, options.ui || {});
		runtime.worldModels = null;
		installViewport(runtime);
		installRuntimePerformanceMonitor(runtime);
		boot.begin('diagnostics-and-loop');
		const diagnostics = installWorldDiagnostics(runtime);
		const movement = options.startLoop === false
			? null
			: startEretzRuntime(runtime, diagnostics);
		const localRpg = options.localRpg
			|| new MitzvahWorldLocalRpgSession(options);
		attachRuntimeDiagnostics(diagnostics, runtime, movement, localRpg);
		diagnostics.bootPhases = () => boot.snapshot();
		diagnostics.qualityProfile = { ...qualityProfile };
		diagnostics.actorHydrationPromise = startEretzActorHydration(
			runtime,
			foundation.actorHydration,
			boot
		);
		boot.complete();
		setDebugHudVisibility(hosts?.hud);
		startEretzPostMovementStreaming({
			boot,
			diagnostics,
			foundation,
			movement,
			options,
			qualityProfile,
			runtime
		});
		publishRuntime(diagnostics);
		return diagnostics;
	} catch (error) {
		boot.fail(error);
		exposeBootFailure(error, hosts);
		throw error;
	} finally {
		if (globalThis.AwtsmoosBootTracker === boot) {
			globalThis.AwtsmoosBootTracker = null;
		}
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
	return failure;
}

function setDebugHudVisibility(hud) {
	if (!hud || typeof location === 'undefined') return;
	const showDebug = new URLSearchParams(location.search).get('debug') === '1';
	hud.style.display = showDebug ? '' : 'none';
}

export default createEretzRuntime;
