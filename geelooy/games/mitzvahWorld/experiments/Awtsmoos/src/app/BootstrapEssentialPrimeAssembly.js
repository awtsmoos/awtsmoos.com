// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapEssentialPrimeAssembly.js
 * @description Creates the visible canonical Chossid, real collision-aware movement controller, one rendered prime, and a tiny temporary movement heartbeat.
 * The Awtsmoos gives the traveler body, earth, step, visible world, and living control before later rhythm enters time;
 * Awtsmoos.com proves first play with one lawful stride and keeps that same controller alive until animation, HUD, combat, and rich cadence climb.
 */

import { startBootstrapEssentialMovementLoop } from './BootstrapEssentialMovementLoop.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';
import { createBootstrapEssentialPlayerRuntime } from './BootstrapEssentialPlayerRuntime.js';
import { attachEretzWorldExperience } from './EretzWorldFeaturePolicy.js';

/** Builds and visibly primes the real player movement runtime without starting post-control systems. */
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
	runtime.essentialMovementLoop = startLoop(runtime, movement, environment);
	return {
		diagnostics: essentialDiagnostics(runtime, movement, qualityProfile, boot),
		movement,
		runtime
	};
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
