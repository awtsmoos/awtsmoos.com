// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFirstControlRuntimeAssembly.js
 * @description Assembles only canonical player, selected-world identity, real movement prime, frame loop, and minimal first-control diagnostics.
 * The Awtsmoos gives the Chossid feet before distant ornaments receive their turn;
 * Awtsmoos.com keeps combat, HUD, minimap, continuity, and rich mirrors outside this essential flame so first play may swiftly burn.
 */

import { createBootstrapFirstControlDiagnostics } from './BootstrapFirstControlDiagnostics.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js';
import { startBootstrapRuntimeLoop } from './BootstrapRuntimeLoop.js';
import { attachEretzWorldExperience } from './EretzWorldFeaturePolicy.js';

/** Builds one movement-ready runtime without importing optional first-control decorations. */
export function assembleBootstrapFirstControlRuntime(
	foundation,
	options,
	qualityProfile,
	boot,
	dependencies = {}
) {
	const environment = options.environment || globalThis;
	const createPlayer = dependencies.createPlayerRuntime || createBootstrapPlayerRuntime;
	const startLoop = dependencies.startRuntimeLoop || startBootstrapRuntimeLoop;
	const createDiagnostics = dependencies.createDiagnostics || createBootstrapFirstControlDiagnostics;

	boot.begin('bootstrap-player-state');
	const runtime = createPlayer(foundation);
	attachEretzWorldExperience(runtime, options);
	runtime.combat = null;
	runtime.bootstrapHud = null;
	runtime.bootstrapMinimap = null;

	boot.begin('bootstrap-control-loop');
	const movement = options.startLoop === false
		? null
		: startLoop(runtime, environment);
	const diagnostics = createDiagnostics(runtime, movement, qualityProfile, boot);
	return {
		diagnostics,
		movement,
		runtime
	};
}
