//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file BootstrapCoreRuntimeAssembly.js
 * @description Assembles only the first-control systems authorized by the selected world.
 * The Awtsmoos grants every world its measured vessel; Awtsmoos.com keeps Blank Meadow bare,
 * adding continuity without awakening combat or map systems that its policy does not share.
 */

import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { installBootstrapCoreStateSystems } from './BootstrapCoreStateSystems.js';
import { MinimalMeadowBootstrapCombat } from './MinimalMeadowBootstrapCombat.js';
import { createMinimalMeadowBootstrapMinimap } from './MinimalMeadowBootstrapMinimap.js';
import { createBootstrapPlayerRuntime } from './BootstrapPlayerRuntime.js?v=20260723-visible-02';
import { createBootstrapRuntimeDiagnostics } from './BootstrapRuntimeDiagnostics.js?v=20260804-map-01';
import { startBootstrapRuntimeLoop } from './BootstrapRuntimeLoop.js?v=20260804-map-01';
import {
	attachEretzWorldExperience,
	eretzWorldFeatureEnabled
} from './EretzWorldFeaturePolicy.js';

const BLANK_MEADOW_ID = 'blank-meadow';

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
	const installStateSystems = dependencies.installStateSystems || installBootstrapCoreStateSystems;
	const startLoop = dependencies.startRuntimeLoop || startBootstrapRuntimeLoop;
	const createMinimap = dependencies.createMinimap || createMinimalMeadowBootstrapMinimap;
	const Combat = dependencies.Combat || MinimalMeadowBootstrapCombat;

	boot.begin('bootstrap-player-state');
	const runtime = createPlayer(foundation);
	attachEretzWorldExperience(runtime, options);
	if (runtime.worldExperience?.id === BLANK_MEADOW_ID) {
		installStateSystems(runtime, environment);
	}

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

	const diagnostics = createDiagnostics(runtime, movement, qualityProfile, boot);
	diagnostics.worldExperience = runtime.worldExperience;
	return { diagnostics, movement, runtime };
}
