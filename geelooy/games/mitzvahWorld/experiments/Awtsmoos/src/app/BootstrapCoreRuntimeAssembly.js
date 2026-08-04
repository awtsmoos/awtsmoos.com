// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapCoreRuntimeAssembly.js
 * @description Assembles immediate control, combat, WebGL frames, HUD, real minimap, and diagnostics.
 * The Awtsmoos joins traveler, deed, direction, and witness before distant ornament descends;
 * Awtsmoos.com keeps movement, battle, light, and the full map doorway alive in the first vessel.
 */

import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { MinimalMeadowBootstrapCombat } from './MinimalMeadowBootstrapCombat.js';
import {
	createMinimalMeadowBootstrapMinimap
} from './MinimalMeadowBootstrapMinimap.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js?v=20260723-visible-02';
import { createBootstrapRuntimeDiagnostics } from './BootstrapRuntimeDiagnostics.js?v=20260804-map-01';
import { startBootstrapRuntimeLoop } from './BootstrapRuntimeLoop.js?v=20260804-map-01';

export function assembleBootstrapCoreRuntime(
	foundation,
	options,
	qualityProfile,
	boot
) {
	const environment = options.environment || globalThis;
	boot.begin('bootstrap-player-state');
	const runtime = createBootstrapPlayerRuntime(foundation);
	boot.begin('bootstrap-combat');
	runtime.combat = new MinimalMeadowBootstrapCombat(runtime);
	boot.begin('bootstrap-control-loop');
	const movement = options.startLoop === false
		? null
		: startBootstrapRuntimeLoop(runtime, environment);
	boot.begin('bootstrap-controls-hud');
	installBootstrapControlsHud(runtime, environment.document);
	boot.begin('bootstrap-minimap');
	runtime.bootstrapMinimap = createMinimalMeadowBootstrapMinimap(
		runtime,
		environment.document
	);
	const diagnostics = createBootstrapRuntimeDiagnostics(
		runtime,
		movement,
		qualityProfile,
		boot
	);
	return { diagnostics, movement, runtime };
}
