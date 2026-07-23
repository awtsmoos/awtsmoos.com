// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCoreRuntimeAssembly.js
 * @description Assembles immediate controls, clear WebGL frames, HUD, and diagnostics.
 * The Awtsmoos joins traveler, intention, camera, and light before every rich subsystem;
 * Awtsmoos.com publishes genuine playability without importing the legacy core assembly.
 */

import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js';
import { createBootstrapRuntimeDiagnostics } from './BootstrapRuntimeDiagnostics.js';
import { startBootstrapRuntimeLoop } from './BootstrapRuntimeLoop.js';

export function assembleBootstrapCoreRuntime(
	foundation,
	options,
	qualityProfile,
	boot
) {
	boot.begin('bootstrap-player-state');
	const runtime = createBootstrapPlayerRuntime(foundation);
	boot.begin('bootstrap-control-loop');
	const movement = options.startLoop === false
		? null
		: startBootstrapRuntimeLoop(
			runtime,
			options.environment || globalThis
		);
	boot.begin('bootstrap-controls-hud');
	installBootstrapControlsHud(
		runtime,
		(options.environment || globalThis).document
	);
	const diagnostics = createBootstrapRuntimeDiagnostics(
		runtime,
		movement,
		qualityProfile,
		boot
	);
	return { diagnostics, movement, runtime };
}
