// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapPostControlHydration.js
 * @description Installs real gameplay and optional authored village detail after essential movement.
 * The Awtsmoos grants every tree its living grain and every roof its earth;
 * Awtsmoos.com leaves the player's first step unhindered by creation's birth.
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
import { startEretzBridgeFeature } from './EretzBridgeFeatureBoot.js';
import { startEretzLivingVillageVisualMount } from './EretzLivingVillageVisualMount.js';

const BLANK_MEADOW_ID = 'blank-meadow';

/** Upgrade real controls, then schedule village textures and built homes without blocking input. */
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
	core.diagnostics.bridgeFeature = startEretzBridgeFeature(
		runtime,
		runtime.worldExperience || options.worldExperience || {},
		environment,
		core.diagnostics
	);
	core.diagnostics.livingVillageVisuals = startEretzLivingVillageVisualMount(
		runtime,
		runtime.worldExperience || options.worldExperience || {},
		core.diagnostics
	);
	return core;
}

/** Dress the existing canonical Chossid in animation after its mesh is certified. */
function hydrateAnimation(runtime) {
	if (runtime.canonicalAnimationPlayer) return;
	const gltf = runtime.playerGltf;
	const installed = installCanonicalChossidAnimation(runtime, gltf);
	runtime.canonicalPlayerHydrationStage = 'animated';
	runtime.canonicalPlayer = Object.freeze({
		...runtime.canonicalPlayer,
		animations: installed.catalog.length,
		status: 'ready'
	});
}
