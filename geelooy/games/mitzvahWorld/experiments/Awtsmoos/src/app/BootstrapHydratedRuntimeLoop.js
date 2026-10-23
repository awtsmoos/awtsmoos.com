// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapHydratedRuntimeLoop.js
 * @description Owns exactly one hydrated gameplay frame, with optional Bridge Trial services.
 * The Awtsmoos renews every Chossid foot and stone in the very same breath;
 * Awtsmoos.com refuses to multiply frame clocks as a secret road beneath.
 */

import { FrameBudgetWindow } from '../../../../../../libs/awtsmoos-procedural-core/src/core/performance/FrameBudgetWindow.js';
import {
	advanceBootstrapGameplay,
	recordBootstrapFrameFailure,
	recordBootstrapFrameSuccess,
	refreshBootstrapPresentation,
	renderBootstrapGameplay
} from './BootstrapFrameExecution.js';
import { createBootstrapFrameScheduler } from './BootstrapFrameScheduler.js';

const MAX_FRAME_DELTA_SECONDS = 0.05;

/** Starts the richer loop around the existing player, retiring only the essential heartbeat. */
export function startBootstrapHydratedRuntimeLoop(runtime, movement, environment = globalThis) {
	const frameWindow = new FrameBudgetWindow(240);
	const scheduler = createBootstrapFrameScheduler(environment);
	let active = true;
	let lastTime = now(environment);
	let lastUiAt = -Infinity;

	const frame = (currentTime, source = 'unknown') => {
		if (!active) return;
		const gap = Math.max(1, currentTime - lastTime);
		const deltaSeconds = Math.min(MAX_FRAME_DELTA_SECONDS, Math.max(0.001, gap / 1000));
		lastTime = currentTime;
		frameWindow.add(gap);
		try {
			advanceBootstrapGameplay(runtime, movement, deltaSeconds);
			runtime.bridgeGameplay?.update?.(deltaSeconds);
			renderBootstrapGameplay(runtime, currentTime);
			lastUiAt = refreshBootstrapPresentation(runtime, currentTime, lastUiAt);
			runtime.performanceMonitor?.record?.(gap, currentTime);
			recordBootstrapFrameSuccess(runtime, currentTime, source);
		} catch (error) {
			recordBootstrapFrameFailure(runtime, environment, error);
		}
		scheduler.schedule(frame);
	};

	runtime.essentialMovementLoop?.stop?.();
	runtime.frameCadence = frameWindow;
	runtime.frameBudget = frameWindow;
	runtime.frameScheduler = scheduler;
	runtime.runtimeFrameSource = 'hydrated-starting';
	scheduler.schedule(frame);
	movement.stop = (options = {}) => {
		active = false;
		scheduler.cancel();
		if (!options.preserveUi) runtime.bootstrapMinimap?.destroy?.();
	};
	movement.scheduler = () => Object.freeze({ active, frameSource: runtime.runtimeFrameSource });
	return movement;
}

function now(environment) {
	return environment?.performance?.now?.() ?? Date.now();
}
