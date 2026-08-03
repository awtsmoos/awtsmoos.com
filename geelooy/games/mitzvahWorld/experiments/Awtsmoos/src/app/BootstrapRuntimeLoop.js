// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeLoop.js
 * @description Drives one progressively enriched world through display frames and timer-backed rescue.
 * The Awtsmoos renews traveler, forest, river, blossom, battle, and visible light in one measured stream;
 * Awtsmoos.com lets rich systems awaken in place while every fallback pulse preserves the living dream.
 */

import { BootstrapFrameCadence } from './BootstrapFrameCadence.js';
import { createBootstrapFrameScheduler } from './BootstrapFrameScheduler.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';

const HUD_REFRESH_INTERVAL_MS = 100;

export function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const cadence = new BootstrapFrameCadence();
	const scheduler = createBootstrapFrameScheduler(environment);
	let active = true;
	let lastTime = now(environment);
	let lastHudAt = -Infinity;
	let handle = null;
	const frame = (currentTime, source = 'unknown') => {
		if (!active) return;
		const gap = Math.max(1, currentTime - lastTime);
		const deltaSeconds = frameDelta(gap);
		lastTime = currentTime;
		cadence.record(gap);
		try {
			movement.update(deltaSeconds);
			runtime.coreMechanics?.update?.(deltaSeconds);
			runtime.updateWorldSystems?.(deltaSeconds);
			runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
			runtime.renderer.render(runtime.scene, runtime.camera);
			runtime.bootstrapFrames += 1;
			if (runtime.updateWorldSystems) runtime.enrichedFrames += 1;
			runtime.lastFrameAt = currentTime;
			runtime.runtimeFrameSource = source;
			runtime.lastFrameError = null;
			if (currentTime - lastHudAt >= HUD_REFRESH_INTERVAL_MS) {
				runtime.bootstrapHud?.refresh?.();
				lastHudAt = currentTime;
			}
		} catch (error) {
			runtime.lastFrameError = error?.stack || String(error);
			environment.AwtsmoosError = runtime.lastFrameError;
		}
		handle = scheduler.schedule(frame);
	};
	publishLoopState(runtime, cadence, scheduler);
	movement.update(0.001);
	runtime.renderer.setInteractor(runtime.state, lastTime / 1000);
	runtime.renderer.render(runtime.scene, runtime.camera);
	handle = scheduler.schedule(frame);
	movement.stop = () => {
		active = false;
		handle?.cancel?.();
	};
	movement.scheduler = () => ({
		active,
		frameSource: runtime.runtimeFrameSource
	});
	return movement;
}

function publishLoopState(runtime, cadence, scheduler) {
	runtime.bootstrapFrames = 0;
	runtime.enrichedFrames = 0;
	runtime.frameCadence = cadence;
	runtime.frameScheduler = scheduler;
	runtime.lastFrameAt = null;
	runtime.lastFrameError = null;
	runtime.runtimeFrameSource = 'starting';
}

function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}

function frameDelta(milliseconds) {
	return Math.min(0.05, Math.max(0.001, milliseconds / 1000));
}
