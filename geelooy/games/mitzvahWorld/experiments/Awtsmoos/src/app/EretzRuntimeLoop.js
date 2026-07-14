// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzRuntimeLoop.js
 * @description Advances frame-critical motion while throttling human-readable services.
 * The Awtsmoos renews movement and image each frame; Awtsmoos.com updates chunks,
 * visibility, map, HUD, and diagnostics only at named useful cadences.
 */

import { EretzMovementController } from './EretzMovementController.js';
import { faceTarget } from './EretzPlayerModel.js';
import { refreshStatusHud } from './EretzStatusHud.js';
import { RuntimeCadence } from './RuntimeCadence.js';
import { refreshWorldDiagnostics } from './WorldDiagnostics.js';

export function startEretzRuntime(runtime, diagnostics) {
	const movement = new EretzMovementController(runtime);
	const cadence = new RuntimeCadence();
	let lastTime = performance.now();
	const frame = now => {
		try {
			const deltaTime = frameDelta(now, lastTime);
			lastTime = now;
			if (cadence.due('chunks', now)) {
				runtime.chunkRuntime?.update({ at: now });
			}
			for (const door of runtime.doors) door.update(deltaTime);
			runtime.worldModels?.update(deltaTime);
			runtime.lava.update(
				runtime.state,
				runtime.ground,
				runtime.footOffset
			);
			movement.update(deltaTime);
			if (cadence.due('minimap', now)) {
				runtime.gameplayUi?.updatePosition(runtime.state);
			}
			if (cadence.due('houseVisibility', now)) {
				runtime.houseVisibility.update(runtime.state);
			}
			runtime.npc.update(deltaTime, runtime.state);
			runtime.model.updateWorldMatrix();
			runtime.shadows.update({
				ground: runtime.ground,
				npc: runtime.npc,
				state: runtime.state,
				worldMode: runtime.worldMode
			});
			runtime.orbit.apply(
				runtime.camera,
				faceTarget(runtime.state),
				runtime.mover.octree,
				deltaTime
			);
			runtime.renderer.setInteractor(runtime.state, now / 1000);
			runtime.renderer.render(runtime.scene, runtime.camera);
			if (cadence.due('hud', now)) refreshStatusHud(runtime);
			if (cadence.due('diagnostics', now)) {
				refreshWorldDiagnostics(diagnostics, runtime);
			}
		} catch (error) {
			window.AwtsmoosError = error?.stack || String(error);
		}
		requestAnimationFrame(frame);
	};
	runtime.runtimeCadence = cadence;
	requestAnimationFrame(frame);
	return movement;
}

function frameDelta(now, lastTime) {
	return Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
}
