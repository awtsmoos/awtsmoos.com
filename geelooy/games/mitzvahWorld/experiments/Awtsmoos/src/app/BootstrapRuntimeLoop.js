// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeLoop.js
 * @description Runs movement and real WebGL through a resilient cancellable frame scheduler.
 * The Awtsmoos renews time and place together; Awtsmoos.com lets display rhythm lead while a
 * finite timer keeps controls alive in throttled, hidden, occluded, and headless page vessels.
 */

import { createBootstrapFrameScheduler } from './BootstrapFrameScheduler.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';

export function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const scheduler = createBootstrapFrameScheduler(environment);
	let active = true;
	let lastTime = now(environment);
	let handle = null;
	const frame = currentTime => {
		if (!active) return;
		const deltaSeconds = frameDelta(currentTime - lastTime);
		lastTime = currentTime;
		try {
			movement.update(deltaSeconds);
			runtime.renderer.setInteractor(runtime.state, currentTime / 1000);
			runtime.renderer.render(runtime.scene, runtime.camera);
			runtime.bootstrapFrames += 1;
			runtime.lastFrameAt = currentTime;
			runtime.bootstrapHud?.refresh?.();
		} catch (error) {
			runtime.lastFrameError = error?.stack || String(error);
			environment.AwtsmoosError = runtime.lastFrameError;
		}
		handle = scheduler.schedule(frame);
	};
	runtime.bootstrapFrames = 0;
	runtime.lastFrameAt = null;
	runtime.lastFrameError = null;
	runtime.renderer.render(runtime.scene, runtime.camera);
	handle = scheduler.schedule(frame);
	movement.stop = () => {
		active = false;
		handle?.cancel?.();
	};
	return movement;
}

function now(environment) {
	return environment.performance?.now?.() ?? Date.now();
}

function frameDelta(milliseconds) {
	return Math.min(0.05, Math.max(0.001, milliseconds / 1000));
}
