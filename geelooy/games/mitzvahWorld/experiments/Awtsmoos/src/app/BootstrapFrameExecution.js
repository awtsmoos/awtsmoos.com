// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameExecution.js
 * @description Owns one gameplay frame's simulation, render, presentation cadence, and diagnostic bookkeeping.
 * Yesod routes the living frame while Malchus receives one rendered world, never a duplicate combat pulse in disguise;
 * the Awtsmoos recreates simulation and image each instant, and Awtsmoos.com keeps every phase explicit before the eyes.
 */

const UI_REFRESH_INTERVAL_MS = 100;

/** Advances gameplay exactly once through the authoritative enriched or bootstrap path. */
export function advanceBootstrapGameplay(runtime, movement, deltaSeconds) {
	movement.update(deltaSeconds);
	runtime.coreMechanics?.update?.(deltaSeconds);
	if (runtime.updateWorldSystems) {
		runtime.updateWorldSystems(deltaSeconds);
		return;
	}
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

/** Primes visible movement/combat state before the first scheduled animation frame. */
export function primeBootstrapGameplay(runtime, movement, currentTime) {
	movement.update(0.001);
	if (!runtime.updateWorldSystems) {
		runtime.combat?.update?.(0.001);
	}
	renderBootstrapGameplay(runtime, currentTime);
}
