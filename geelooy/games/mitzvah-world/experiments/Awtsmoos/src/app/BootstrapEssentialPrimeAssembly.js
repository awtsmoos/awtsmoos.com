// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapEssentialPrimeAssembly.js
 * @description Creates the canonical Chossid, real collision movement, one rendered prime, and authoritative first-control evidence.
 * The Awtsmoos gives the traveler a real step before naming the step complete;
 * Awtsmoos.com records movement only after body, collision, movement update, and visible render have all become fact.
 */

import { startBootstrapEssentialMovementLoop } from './BootstrapEssentialMovementLoop.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';
import { createBootstrapEssentialPlayerRuntime } from './BootstrapEssentialPlayerRuntime.js';
import { attachEretzWorldExperience } from './EretzWorldFeaturePolicy.js';
import {
	ESSENTIAL_MILESTONES,
	completeMitzvahWorldEssentialMilestone
} from './MitzvahWorldEssentialBoot.js';
import { markMitzvahWorldStartupMilestone } from './MitzvahWorldStartupMilestones.js';

/** Builds, visibly primes, and certifies the real player movement runtime before post-control systems. */
export function assembleBootstrapEssentialPrime(
	foundation,
	options,
	qualityProfile,
	boot,
	dependencies = {}
) {
	const environment = options.environment || globalThis;
	const createPlayer = dependencies.createPlayerRuntime || createBootstrapEssentialPlayerRuntime;
	const MovementController = dependencies.MovementController || BootstrapMovementController;
	const startLoop = dependencies.startEssentialLoop || startBootstrapEssentialMovementLoop;
	boot.begin('bootstrap-essential-player');
	const runtime = createPlayer(foundation);
	attachEretzWorldExperience(runtime, options);
	runtime.combat = null;
	runtime.bootstrapHud = null;
	runtime.bootstrapMinimap = null;
	runtime.bootstrapFrames = 0;
	runtime.enrichedFrames = 0;

	boot.begin('bootstrap-essential-movement-prime');
	const movement = new MovementController(runtime);
	movement.update(0.001);
	renderPrime(runtime, now(environment));
	runtime.bootstrapFrames = 1;
	runtime.lastFrameError = null;
	runtime.runtimeFrameSource = 'essential-prime';
	publishMovementReady(environment);
	runtime.essentialMovementLoop = startLoop(runtime, movement, environment);
	return {
		diagnostics: essentialDiagnostics(runtime, movement, qualityProfile, boot),
		movement,
		runtime
	};
}

/** Publishes the existing movement fact only after the real prime movement transaction succeeds. */
function publishMovementReady(environment) {
	completeMitzvahWorldEssentialMilestone(
		environment,
		ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED,
		{ importerStage: 'bootstrap-runtime-prime' }
	);
	markMitzvahWorldStartupMilestone(environment, 'playerControllable');
}

/** Renders the moved canonical player through the already-live foundation renderer. */
function renderPrime(runtime, currentTime) {
	runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
	runtime.renderer.render(runtime.scene, runtime.camera);
	runtime.lastFrameAt = currentTime;
}

/** Exposes only the facts needed before richer diagnostics hydrate after control. */
function essentialDiagnostics(runtime, movement, qualityProfile, boot) {
	return {
		assets: runtime.assets,
		bootPhases: () => boot.snapshot(),
		bootstrap: true,
		ground: runtime.ground,
		mainOctree: runtime.mainOctree,
		movement,
		movementState: () => movement.snapshot(),
		player: runtime.player,
		qualityProfile: { ...qualityProfile },
		runtime,
		state: runtime.state,
		terrain: runtime.terrain,
		worldExperience: runtime.worldExperience
	};
}

function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
