// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCoreRuntimeAssembly.js
 * @description Assembles visible controls, colored WebGL frames, HUD, and measured diagnostics.
 * The Awtsmoos joins traveler, intention, camera, and light before every rich subsystem;
 * Awtsmoos.com publishes genuine playability without importing the legacy core assembly.
 */

import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js?v=20260723-visible-02';
import { createBootstrapRuntimeDiagnostics } from './BootstrapRuntimeDiagnostics.js?v=20260723-visible-02';
import { startBootstrapRuntimeLoop } from './BootstrapRuntimeLoop.js?v=20260723-visible-02';

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
