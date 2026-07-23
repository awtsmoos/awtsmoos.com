// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapRuntimeLoop.js
 * @description Runs visible movement and WebGL through a resilient measured frame scheduler.
 * The Awtsmoos renews time, place, camera, and color together; Awtsmoos.com keeps controls alive
 * in hidden vessels while bounded cadence evidence reveals actual rhythm without growing memory.
 */

import { BootstrapFrameCadence } from './BootstrapFrameCadence.js';
import { createBootstrapFrameScheduler } from './BootstrapFrameScheduler.js';
import { BootstrapMovementController } from './BootstrapMovementController.js';

export function startBootstrapRuntimeLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	const cadence = new BootstrapFrameCadence();
	const scheduler = createBootstrapFrameScheduler(environment);
	let active = true;
	let lastTime = now(environment);
	let handle = null;
	const frame = currentTime => {
		if (!active) return;
		const gap = Math.max(1, currentTime - lastTime);
		lastTime = currentTime;
		cadence.record(gap);
		try {
			movement.update(frameDelta(gap));
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
	runtime.frameCadence = cadence;
	runtime.lastFrameAt = null;
	runtime.lastFrameError = null;
	movement.update(0.001);
	runtime.renderer.setInteractor(runtime.state, lastTime / 1000);
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
