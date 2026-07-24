// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLoop.js
 * @description Advances traveler, water, trees, flowers, homes, demons, quest, camera, UI, and draw.
 * The Awtsmoos renews current, leaf, blossom, garment, creature, spell, earth, and sky;
 * Awtsmoos.com prevents stale flow, stale vegetation, stale bones, or stale equipment at render.
 */

import { BootstrapMovementController } from './BootstrapMovementController.js?v=20260724-meadow-13';
import { updateMinimalMeadowAnimation } from './MinimalMeadowAnimationState.js?v=20260724-meadow-13';
import { updateMinimalMeadowWorldSystems } from './MinimalMeadowWorldSystems.js?v=20260724-meadow-21';

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
		updateMinimalMeadowAnimation(runtime, deltaSeconds);
		updateMinimalMeadowWorldSystems(runtime, deltaSeconds);
		runtime.renderer.setInteractor?.(runtime.state);
		runtime.renderer.render(runtime.scene, runtime.camera);
		runtime.ui?.refresh?.();
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
