// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPostControlHydration.js
 * @description Hydrates animation, full cadence, continuity, combat, HUD, minimap, and rich diagnostics onto the already-movable canonical runtime.
 * The Awtsmoos clothes the traveler after the traveler already stands and moves;
 * Awtsmoos.com adds rhythm and instruments to the same body and movement vessel, never rebuilding first control after it proves.
 */

import { AwtsmoosEventBus } from '../ui/AwtsmoosEventBus.js';
import { installBootstrapControlsHud } from './BootstrapControlsHud.js';
import { installBootstrapCoreStateSystems } from './BootstrapCoreStateSystems.js';
import { startBootstrapHydratedRuntimeLoop } from './BootstrapHydratedRuntimeLoop.js';
import { createBootstrapRuntimeDiagnostics } from './BootstrapRuntimeDiagnostics.js';
import { installCanonicalChossidAnimation } from './MinimalMeadowCanonicalAnimation.js';
import { MinimalMeadowBootstrapCombat } from './MinimalMeadowBootstrapCombat.js';
import { createMinimalMeadowBootstrapMinimap } from './MinimalMeadowBootstrapMinimap.js';
import { eretzWorldFeatureEnabled } from './EretzWorldFeaturePolicy.js';

const BLANK_MEADOW_ID = 'blank-meadow';

/** Upgrades one proven first-control runtime in place and preserves its movement identity. */
export function hydrateBootstrapPostControl(core, options, qualityProfile, boot) {
	const { runtime, movement } = core;
	const environment = options.environment || globalThis;
	boot.begin('post-control-animation');
	hydrateAnimation(runtime);
	runtime.bus ||= new AwtsmoosEventBus();
	if (runtime.worldExperience?.id === BLANK_MEADOW_ID) {
		installBootstrapCoreStateSystems(runtime, environment);
	}
	if (eretzWorldFeatureEnabled(options, 'bootstrapCombat')) {
		runtime.combat = new MinimalMeadowBootstrapCombat(runtime);
	}
	startBootstrapHydratedRuntimeLoop(runtime, movement, environment);
	boot.begin('post-control-ui');
	installBootstrapControlsHud(runtime, environment.document);
	if (eretzWorldFeatureEnabled(options, 'bootstrapMinimap')) {
		runtime.bootstrapMinimap = createMinimalMeadowBootstrapMinimap(runtime, environment.document);
	}
	const richDiagnostics = createBootstrapRuntimeDiagnostics(runtime, movement, qualityProfile, boot);
	Object.assign(core.diagnostics, richDiagnostics);
	core.diagnostics.worldExperience = runtime.worldExperience;
	runtime.postControlHydrated = true;
	return core;
}

function hydrateAnimation(runtime) {
	if (runtime.canonicalAnimationPlayer) return;
	const gltf = runtime.playerGltf;
	const installed = installCanonicalChossidAnimation(runtime, gltf, runtime.visiblePlayer);
	runtime.canonicalPlayerHydrationStage = 'animated';
	runtime.canonicalPlayer = Object.freeze({
		...runtime.canonicalPlayer,
		animations: installed.catalog.length,
		status: 'animated'
	});
}
