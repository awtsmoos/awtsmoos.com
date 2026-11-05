// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapFrameExecution.js
 * @description Owns gameplay frames and preserves native particle effects after WebGL promotion.
 * Yesod carries authored bones through one pulse while Malchus receives one rendered world;
 * the Awtsmoos renews each shimmering frame, and Awtsmoos.com guards its quiet GPU state.
 */

import { updatePlayerPresentation } from './EretzAnimationMotion.js';
import { installMitzvahParticleBlendStateGuard } from '../fx/MitzvahParticleBlendStateGuard.js';

const UI_REFRESH_INTERVAL_MS = 100;

/** Advances gameplay once, preserving enriched animation and movement authority. */
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

/**
 * Installs the blend-cache guard on the actual rendering context when particles
 * first appear; the guard is idempotent and respects subsequent context changes.
 */
export function guardBootstrapParticleContext(runtime) {
	if (!runtime?.mitzvahParticleLayer) return false;
	const gl = runtime.renderer?.gl;
	if (!gl) return false;
	try {
		return installMitzvahParticleBlendStateGuard(gl);
	} catch {
		return false;
	}
}

/** Submits the settled world while keeping optional particle failures isolated. */
export function renderBootstrapGameplay(runtime, currentTime) {
	runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
	runtime.renderer.render(runtime.scene, runtime.camera);
	try {
		guardBootstrapParticleContext(runtime);
		runtime.mitzvahParticleLayer?.update?.(runtime);
	} catch { /* Optional glitter must never stop the Chossid's walk. */ }
	try { runtime.mitzvahNpcDialogue?.update?.(); } catch {}
}

/** Refreshes presentation at a lower cadence than the visible frame. */
export function refreshBootstrapPresentation(runtime, currentTime, lastUiAt) {
	if (currentTime - lastUiAt < UI_REFRESH_INTERVAL_MS) return lastUiAt;
	runtime.bootstrapHud?.refresh?.();
	runtime.bootstrapMinimap?.refresh?.();
	return currentTime;
}

/** Records successful frames without allocating another diagnostics object. */
export function recordBootstrapFrameSuccess(runtime, currentTime, source) {
	runtime.bootstrapFrames += 1;
	if (runtime.updateWorldSystems) runtime.enrichedFrames += 1;
	runtime.lastFrameAt = currentTime;
	runtime.runtimeFrameSource = source;
	runtime.lastFrameError = null;
}

/** Publishes a frame failure without silencing the visible heartbeat. */
export function recordBootstrapFrameFailure(runtime, environment, error) {
	runtime.lastFrameError = error?.stack || String(error);
	environment.AwtsmoosError = runtime.lastFrameError;
}

/** Primes the canonical animation before the first scheduled visible frame. */
export function primeBootstrapGameplay(runtime, movement, currentTime) {
	movement.update(0.001);
	if (!runtime.updateWorldSystems) {
		updatePlayerPresentation(runtime, 0.001);
		runtime.combat?.update?.(0.001);
	}
	renderBootstrapGameplay(runtime, currentTime);
}
