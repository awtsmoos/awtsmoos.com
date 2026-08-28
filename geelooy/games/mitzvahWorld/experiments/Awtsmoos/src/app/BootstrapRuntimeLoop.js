//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeLoop.js
 * @description Owns one display-synchronized gameplay heartbeat while importing only the focused frame-evidence vessel instead of awakening the entire procedural-core performance graph before first control.
 * Keter crowns one visible pulse while Yesod carries simulation, rendering, and diagnostics without duplicate clocks below;
 * the Awtsmoos recreates every instant before the browser may request it, and Awtsmoos.com keeps first play narrow so the living frame may flow.
 */

import {
	FrameBudgetWindow
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/performance/FrameBudgetWindow.js';
import {
	advanceBootstrapGameplay,
	primeBootstrapGameplay,
	recordBootstrapFrameFailure,
	recordBootstrapFrameSuccess,
	refreshBootstrapPresentation,
	renderBootstrapGameplay
} from './BootstrapFrameExecution.js';
import { createBootstrapFrameScheduler } from './BootstrapFrameScheduler.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';

const MAX_FRAME_DELTA_SECONDS = 0.05;

/**
 * Starts the main visual gameplay loop without multiplying animation clocks.
 * @param {object} runtime Active MitzvahWorld runtime.
 * @param {object} environment Browser-like scheduling environment.
 * @returns {BootstrapMovementController} Active movement controller.
 */
export function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const frameWindow = new FrameBudgetWindow(240);
	const scheduler = createBootstrapFrameScheduler(environment);
	let active = true;
	let lastTime = now(environment);
	let lastUiAt = -Infinity;

	const frame = (currentTime, source = 'unknown') => {
		if (!active) {
			return;
		}
		const gap = Math.max(1, currentTime - lastTime);
		const deltaSeconds = frameDelta(gap);
		lastTime = currentTime;
		frameWindow.add(gap);
		try {
			advanceBootstrapGameplay(runtime, movement, deltaSeconds);
			renderBootstrapGameplay(runtime, currentTime);
			lastUiAt = refreshBootstrapPresentation(
				runtime,
				currentTime,
				lastUiAt
			);
			recordBootstrapFrameSuccess(runtime, currentTime, source);
		} catch (error) {
			recordBootstrapFrameFailure(runtime, environment, error);
		}
		scheduler.schedule(frame);
	};

	publishLoopState(runtime, frameWindow, scheduler);
	primeBootstrapGameplay(runtime, movement, lastTime);
	scheduler.schedule(frame);
	movement.stop = (options = {}) => {
		active = false;
		scheduler.cancel();
		if (!options.preserveUi) {
			runtime.bootstrapMinimap?.destroy?.();
		}
	};
	movement.scheduler = () => {
		return {
			active,
			frameSource: runtime.runtimeFrameSource
		};
	};
	return movement;
}

/** Publishes frame evidence and scheduler ownership for runtime diagnostics. */
function publishLoopState(runtime, frameWindow, scheduler) {
	runtime.bootstrapFrames = 0;
	runtime.enrichedFrames = 0;
	runtime.frameCadence = frameWindow;
	runtime.frameBudget = frameWindow;
	runtime.frameScheduler = scheduler;
	runtime.lastFrameAt = null;
	runtime.lastFrameError = null;
	runtime.runtimeFrameSource = 'starting';
}

/** Returns the best monotonic time available from the runtime vessel. */
function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}

/** Bounds one simulation delta so a delayed frame cannot explode movement. */
function frameDelta(milliseconds) {
	return Math.min(
		MAX_FRAME_DELTA_SECONDS,
		Math.max(0.001, milliseconds / 1000)
	);
}
