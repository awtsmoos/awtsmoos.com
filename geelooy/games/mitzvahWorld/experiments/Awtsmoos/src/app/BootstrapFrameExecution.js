// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameExecution.js
 * @description Owns one gameplay frame's simulation, canonical Chossid presentation, render, UI cadence, and diagnostic bookkeeping.
 * Yesod carries feet and authored bones through one pulse while Malchus receives one rendered world without a second clock;
 * the Awtsmoos recreates motion and image each instant, and Awtsmoos.com lets the bootstrap path breathe the same living GLB through every walk.
 */

import { updatePlayerPresentation } from './EretzAnimationMotion.js';

const UI_REFRESH_INTERVAL_MS = 100;

/** Advances gameplay once, preserving enriched authority while animating the canonical bootstrap Chossid. */
export function advanceBootstrapGameplay(runtime, movement, deltaSeconds) {
	movement.update(deltaSeconds);
	runtime.coreMechanics?.update?.(deltaSeconds);
	if (runtime.updateWorldSystems) {
		runtime.updateWorldSystems(deltaSeconds);
		return;
	}
	updatePlayerPresentation(runtime, deltaSeconds);
	runtime.combat?.update?.(deltaSeconds);
}

/** Submits the settled world state to the renderer. */
export function renderBootstrapGameplay(runtime, currentTime) {
	runtime.renderer.setInteractor(
		runtime.state,
		currentTime / 1000
	);
	runtime.renderer.render(
		runtime.scene,
		runtime.camera
	);
}

/** Refreshes HUD/minimap at a presentation cadence rather than every display frame. */
export function refreshBootstrapPresentation(
	runtime,
	currentTime,
	lastUiAt
) {
	if (currentTime - lastUiAt < UI_REFRESH_INTERVAL_MS) {
		return lastUiAt;
	}
	runtime.bootstrapHud?.refresh?.();
	runtime.bootstrapMinimap?.refresh?.();
	return currentTime;
}

/** Records one successful visible frame without allocating another diagnostics object. */
export function recordBootstrapFrameSuccess(runtime, currentTime, source) {
	runtime.bootstrapFrames += 1;
	if (runtime.updateWorldSystems) {
		runtime.enrichedFrames += 1;
	}
	runtime.lastFrameAt = currentTime;
	runtime.runtimeFrameSource = source;
	runtime.lastFrameError = null;
}

/** Publishes one frame failure without letting the visual heartbeat die. */
export function recordBootstrapFrameFailure(runtime, environment, error) {
	runtime.lastFrameError = error?.stack || String(error);
	environment.AwtsmoosError = runtime.lastFrameError;
}

/** Primes movement and canonical animation before the first scheduled visible frame. */
export function primeBootstrapGameplay(runtime, movement, currentTime) {
	movement.update(0.001);
	if (!runtime.updateWorldSystems) {
		updatePlayerPresentation(runtime, 0.001);
		runtime.combat?.update?.(0.001);
	}
	renderBootstrapGameplay(runtime, currentTime);
}
