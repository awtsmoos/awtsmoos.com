// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createEretzRuntime.js
 * @description Publishes a quality-aware playable world before optional richness settles.
 * The Awtsmoos renews one essential adventure through desktop and mobile vessels;
 * Awtsmoos.com exposes the chosen density, distance, DPR, and model budget as evidence.
 */

import { MitzvahWorldLocalRpgSession } from '../network/MitzvahWorldLocalRpgSession.js';
import { resolveWorldQuality } from '../performance/WorldQualityProfile.js';
import { BootPhaseTracker } from './BootPhaseTracker.js';
import { startDeferredWorldModels } from './DeferredWorldModelLoader.js';
import { createEretzActors } from './EretzActorSystem.js';
import { attachRuntimeDiagnostics } from './EretzRuntimeDiagnostics.js';
import { startEretzRuntime } from './EretzRuntimeLoop.js';
import { createEretzUi } from './EretzUiSystem.js';
import { installViewport } from './EretzViewport.js';
import { createEretzWorldFoundation } from './EretzWorldFoundation.js';
import { installWorldDiagnostics } from './WorldDiagnostics.js';

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
		boot.begin('diagnostics-and-loop');
		const diagnostics = installWorldDiagnostics(runtime);
		const movement = options.startLoop === false
			? null
			: startEretzRuntime(runtime, diagnostics);
		const localRpg = options.localRpg
			|| new MitzvahWorldLocalRpgSession(options);
		attachRuntimeDiagnostics(
			diagnostics,
			runtime,
			movement,
			localRpg
		);
		diagnostics.bootPhases = () => boot.snapshot();
		diagnostics.qualityProfile = { ...qualityProfile };
		boot.complete();
		diagnostics.worldModelPromise = startDeferredWorldModels(
			foundation,
			runtime,
			diagnostics,
			{
				...options,
				quality: qualityProfile.quality
			},
			boot
		);
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
		hosts.hud.textContent = `B"H world initialization failed: ${failure.message}`;
	}
	console.error('B"H Mitzvah World initialization failed.', error);
	return failure;
}

export default createEretzRuntime;
