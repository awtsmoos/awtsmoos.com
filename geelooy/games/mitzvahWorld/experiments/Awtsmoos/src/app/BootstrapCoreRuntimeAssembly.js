//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file BootstrapCoreRuntimeAssembly.js
 * @description Assembles only the first-control systems authorized by the selected world.
 * Blank Meadow can therefore remain a true bare reliability vessel while richer worlds retain combat and map affordances.
 * Every optional constructor is injectable so tests can prove a disabled feature is never instantiated.
 */

import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { MinimalMeadowBootstrapCombat } from './MinimalMeadowBootstrapCombat.js';
import { createMinimalMeadowBootstrapMinimap } from './MinimalMeadowBootstrapMinimap.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js?v=20260723-visible-02';
import { createBootstrapRuntimeDiagnostics } from './BootstrapRuntimeDiagnostics.js?v=20260804-map-01';
import { startBootstrapRuntimeLoop } from './BootstrapRuntimeLoop.js?v=20260804-map-01';
import {
	attachEretzWorldExperience,
	eretzWorldFeatureEnabled
} from './EretzWorldFeaturePolicy.js';

/**
 * Builds immediate player control while respecting the selected world's immutable feature contract.
 * @param {object} foundation First-frame world foundation.
 * @param {object} options Runtime and selected-world options.
 * @param {object} qualityProfile Resolved device quality policy.
 * @param {object} boot Boot-phase recorder.
 * @param {object} dependencies Optional test substitutions for side-effecting bootstrap systems.
 * @returns {object} Runtime, movement handle, and public diagnostics.
 */
export function assembleBootstrapCoreRuntime(
	foundation,
	options,
	qualityProfile,
	boot,
	dependencies = {}
) {
	const environment = options.environment || globalThis;
	const createPlayer = dependencies.createPlayerRuntime || createBootstrapPlayerRuntime;
	const createDiagnostics = dependencies.createDiagnostics || createBootstrapRuntimeDiagnostics;
	const installControls = dependencies.installControlsHud || installBootstrapControlsHud;
	const startLoop = dependencies.startRuntimeLoop || startBootstrapRuntimeLoop;
	const createMinimap = dependencies.createMinimap || createMinimalMeadowBootstrapMinimap;
	const Combat = dependencies.Combat || MinimalMeadowBootstrapCombat;

	boot.begin('bootstrap-player-state');
	const runtime = createPlayer(foundation);
	attachEretzWorldExperience(runtime, options);

	if (eretzWorldFeatureEnabled(options, 'bootstrapCombat')) {
		boot.begin('bootstrap-combat');
		runtime.combat = new Combat(runtime);
	} else {
		runtime.combat = null;
	}

	boot.begin('bootstrap-control-loop');
	const movement = options.startLoop === false
		? null
		: startLoop(runtime, environment);

	boot.begin('bootstrap-controls-hud');
	installControls(runtime, environment.document);
	if (eretzWorldFeatureEnabled(options, 'bootstrapMinimap')) {
		boot.begin('bootstrap-minimap');
		runtime.bootstrapMinimap = createMinimap(runtime, environment.document);
	} else {
		runtime.bootstrapMinimap = null;
	}

	const diagnostics = createDiagnostics(
		runtime,
		movement,
		qualityProfile,
		boot
	);
	diagnostics.worldExperience = runtime.worldExperience;
	return { diagnostics, movement, runtime };
}
