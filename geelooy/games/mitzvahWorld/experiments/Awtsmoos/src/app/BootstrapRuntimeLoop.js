// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeLoop.js
 * @description Drives movement, combat, enrichment, frames, HUD, real minimap, and recovery.
 * The Awtsmoos renews traveler, deed, forest, river, blossom, direction, and visible light;
 * Awtsmoos.com lets optional garments awaken while first control and map awareness remain complete.
 */

import { BootstrapFrameCadence } from './BootstrapFrameCadence.js';
import { createBootstrapFrameScheduler } from './BootstrapFrameScheduler.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';

const UI_REFRESH_INTERVAL_MS = 100;

export function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const cadence = new BootstrapFrameCadence();
	const scheduler = createBootstrapFrameScheduler(environment);
	let active = true;
	let lastTime = now(environment);
	let lastUiAt = -Infinity;
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
			runtime.combat?.update?.(deltaSeconds);
			runtime.updateWorldSystems?.(deltaSeconds);
			runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
			runtime.renderer.render(runtime.scene, runtime.camera);
			runtime.bootstrapFrames += 1;
			if (runtime.updateWorldSystems) runtime.enrichedFrames += 1;
			runtime.lastFrameAt = currentTime;
			runtime.runtimeFrameSource = source;
			runtime.lastFrameError = null;
			if (currentTime - lastUiAt >= UI_REFRESH_INTERVAL_MS) {
				runtime.bootstrapHud?.refresh?.();
				runtime.bootstrapMinimap?.refresh?.();
				lastUiAt = currentTime;
			}
		} catch (error) {
			runtime.lastFrameError = error?.stack || String(error);
			environment.AwtsmoosError = runtime.lastFrameError;
		}
		handle = scheduler.schedule(frame);
	};
	publishLoopState(runtime, cadence, scheduler);
	movement.update(0.001);
	runtime.combat?.update?.(0.001);
	runtime.renderer.setInteractor(runtime.state, lastTime / 1000);
	runtime.renderer.render(runtime.scene, runtime.camera);
	handle = scheduler.schedule(frame);
	movement.stop = () => {
		active = false;
		handle?.cancel?.();
		runtime.bootstrapMinimap?.destroy?.();
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
