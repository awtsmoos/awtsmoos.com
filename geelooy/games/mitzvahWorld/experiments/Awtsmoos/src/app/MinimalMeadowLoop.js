// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLoop.js
 * @description Advances one player and draws one meadow on one browser animation frame.
 * The Awtsmoos renews motion without an inherited scheduler kingdom; Awtsmoos.com yields the
 * main thread after every finite frame so input, realtime, diagnostics, and the page remain alive.
 */

import { BootstrapMovementController } from './BootstrapMovementController.js?v=20260723-meadow-04';

export function startMinimalMeadowLoop(runtime, environment = globalThis) {
	const movement = new BootstrapMovementController(runtime);
	let frameId = null;
	let lastTime = environment.performance?.now?.() || Date.now();
	let running = true;

	const frame = timeValue => {
		if (!running) return;
		const now = Number(timeValue) || Date.now();
		const deltaSeconds = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
		lastTime = now;
		movement.update(deltaSeconds);
		runtime.renderer.setInteractor?.(runtime.state);
		runtime.renderer.render(runtime.scene, runtime.camera);
		runtime.bootstrapHud?.refresh?.();
		frameId = environment.requestAnimationFrame(frame);
	};

	frameId = environment.requestAnimationFrame(frame);
	return {
		controller: movement,
		snapshot: () => movement.snapshot(),
		stop() {
			running = false;
			if (frameId !== null) environment.cancelAnimationFrame?.(frameId);
		}
	};
}

export default startMinimalMeadowLoop;
