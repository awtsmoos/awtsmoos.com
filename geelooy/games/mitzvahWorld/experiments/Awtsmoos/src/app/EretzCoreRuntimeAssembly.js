// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCoreRuntimeAssembly.js
 * @description Assembles actors, essential UI, diagnostics, and movement after terrain exists.
 * The Awtsmoos joins living forms only when the ground can hold them; Awtsmoos.com keeps
 * this second request wave behind foundation readiness rather than flooding the menu click.
 */

import { MitzvahWorldLocalRpgSession } from '../network/MitzvahWorldLocalRpgSession.js';
import { installRuntimePerformanceMonitor } from '../performance/RuntimePerformanceMonitor.js';
import { createEretzActors } from './EretzActorSystem.js?v=20260720-canonical-valley-pass-04';
import { attachRuntimeDiagnostics } from './EretzRuntimeDiagnostics.js';
import { startEretzRuntime } from './EretzRuntimeLoop.js';
import { createEretzUi } from './EretzUiSystem.js?v=20260720-canonical-valley-pass-06';
import { installViewport } from './EretzViewport.js';
import { installWorldDiagnostics } from './WorldDiagnostics.js';

export function assembleEretzCoreRuntime(foundation, options, qualityProfile, boot) {
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
	const localRpg = options.localRpg || new MitzvahWorldLocalRpgSession(options);
	attachRuntimeDiagnostics(diagnostics, runtime, movement, localRpg);
	diagnostics.bootPhases = () => boot.snapshot();
	diagnostics.qualityProfile = { ...qualityProfile };
	return { diagnostics, movement, runtime };
}
